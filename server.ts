import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import {
  initializeSqliteDatabase,
  getStores,
  addStore,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  deleteSale,
  hasProductSales,
  getSales,
  recordSaleInSqlite,
  getSummaryReport,
  getDailySalesAggregation,
  getDatabaseMetadata,
  getTableRecords,
  executeCustomQuery,
  resetDatabase,
  getDatabaseFilePath,
} from "./sqliteDb";

dotenv.config();

const app = express();
const PORT = 3000;

// Multer memory storage for receipt uploads (image/PDF)
const upload = multer({
  storage: multer.memoryStorage(),
                      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Types
export interface Store {
  storeID: number;
  name: string;
  location: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface DailySale {
  saleID: number;
  storeID: number;
  storeName: string;
  productID: number;
  productName: string;
  productCategory: string;
  productUnitPrice: number;
  saleDate: string;
  quantitySold: number;
  totalAmount: number;
}

// -------------------------------------------------------------
// Gemini AI Initialization (Server-Side Only)
// -------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// Helper Function: MIME Type Verification
// -------------------------------------------------------------
function getValidDocumentMimeType(buffer: Buffer, declaredMime: string): string | null {
  if (!buffer || buffer.length < 8) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "image/png";
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // WebP: RIFF ... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return "image/webp";
  }

  // PDF: %PDF- (25 50 44 46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "application/pdf";
  }

  // Reject text or HTML error documents
  const headerText = buffer.subarray(0, Math.min(buffer.length, 64)).toString("utf8").toLowerCase();
  if (headerText.startsWith("<html") || headerText.startsWith("<!doctype") || headerText.includes("<body") || headerText.includes("404")) {
    return null;
  }

  // Fallback to declared mime if it's an image or PDF
  if (["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(declaredMime)) {
    return declaredMime;
  }

  return null;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 1. DocScanner Route Handler
const handleDocScan = async (req: express.Request, res: express.Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        message: "No document file was uploaded. Please provide a receipt image or PDF.",
      });
    }

    const verifiedMimeType = getValidDocumentMimeType(file.buffer, file.mimetype);
    if (!verifiedMimeType) {
      return res.status(400).json({
        message: "Invalid file format. Please upload a valid JPEG, PNG, WebP, or PDF file.",
      });
    }

    const base64Data = file.buffer.toString("base64");
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(500).json({
        message: "Gemini API key is missing. Please set GEMINI_API_KEY in your environment variables.",
      });
    }

    // Gemini API Request with Strict Prompt & 0.0 Temperature
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: verifiedMimeType,
            data: base64Data,
          },
        },
        `You are a strict and highly accurate document OCR assistant.
        Your job is to read text directly from the receipt image provided.

        CRITICAL INSTRUCTIONS:
        1. Extract EXACT values as visible on the receipt. DO NOT guess, fabricate, or assume any line item, name, or amount.
        2. Match currency symbols exactly (e.g. if $ is present, keep numbers aligned with $, if ₹ is present use ₹).
        3. Extract each line item with its exact description, quantity, unit price, and total as printed.
        4. If a field is not visible or clear, leave it blank or set it to null.

        Output structured JSON matching this schema:
        {
          "receiptNo": "Exact invoice or receipt number",
          "totalAmount": 123.45,
          "date": "YYYY-MM-DD",
          "merchantName": "Exact store or vendor name",
          "taxAmount": "Tax amount as string",
          "paymentMethod": "Payment type if mentioned",
          "items": [
            {
              "description": "Exact item description",
              "quantity": 1,
              "unitPrice": 10.00,
              "lineTotal": 10.00
            }
          ],
          "rawText": "Raw lines detected",
          "confidenceScore": 0.99
        }`
      ],
      config: {
        temperature: 0.0,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            receiptNo: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            merchantName: { type: Type.STRING },
            taxAmount: { type: Type.STRING },
            paymentMethod: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  quantity: { type: Type.INTEGER },
                  unitPrice: { type: Type.NUMBER },
                  lineTotal: { type: Type.NUMBER },
                },
              },
            },
            rawText: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
          },
          required: ["receiptNo", "totalAmount", "merchantName"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini AI.");
    }

    const extractedData = JSON.parse(text);

    return res.json({
      success: true,
      fileName: file.originalname,
      fileSize: file.size,
      processedAt: new Date().toISOString(),
                    ...extractedData,
    });

  } catch (error: any) {
    console.error("Scan error:", error);
    return res.status(500).json({
      message: "An error occurred while processing the document.",
      error: error?.message || "Internal Server Error",
    });
  }
};

app.post("/api/DocScanner/scan", upload.single("file"), handleDocScan);
app.post("/api/docscanner/scan", upload.single("file"), handleDocScan);

// 2. Products API
app.get("/api/products", (_req, res) => {
  try {
    const products = getProducts();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch products from SQLite", error: error.message });
  }
});

app.get("/api/products/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = getProductById(id);
    if (!product) {
      return res.status(404).json({ message: `Product with ID ${id} not found in SQLite.` });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch product from SQLite", error: error.message });
  }
});

app.post("/api/products", (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Product name is required." });
    }

    const newProduct = addProduct(
      name,
      category || "General",
      parseFloat(price) || 0,
                                  parseInt(stock, 10) || 0
    );

    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create product in SQLite", error: error.message });
  }
});

app.put("/api/products/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, category, price, stock } = req.body;

    const updated = updateProduct(id, {
      name,
      category,
      price: price !== undefined ? parseFloat(price) : undefined,
                                  stock: stock !== undefined ? parseInt(stock, 10) : undefined,
    });

    if (!updated) {
      return res.status(404).json({ message: `Product with ID ${id} not found.` });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update product in SQLite", error: error.message });
  }
});

app.delete("/api/products/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = getProductById(id);
    if (!product) {
      return res.status(404).json({ message: `Product with ID ${id} not found.` });
    }

    deleteProduct(id, true);
    res.json({ message: `Product "${product.name}" deleted successfully from SQLite database.` });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete product from SQLite", error: error.message });
  }
});

// 3. Stores API
app.get("/api/stores", (_req, res) => {
  try {
    const stores = getStores();
    res.json(stores);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch stores from SQLite", error: error.message });
  }
});

app.post("/api/stores", (req, res) => {
  try {
    const { name, location } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Store name is required." });
    }

    const newStore = addStore(name, location || "Default Location");
    res.status(201).json(newStore);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create store in SQLite", error: error.message });
  }
});

// 4. Sales API
app.get("/api/sales", (_req, res) => {
  try {
    const sales = getSales();
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch sales from SQLite", error: error.message });
  }
});

app.post("/api/sales", (req, res) => {
  try {
    const { storeID, productID, quantitySold, saleDate } = req.body;

    const sId = parseInt(storeID, 10) || 1;
    const pId = parseInt(productID, 10);
    const qty = parseInt(quantitySold, 10);

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity sold must be greater than zero." });
    }

    const product = getProductById(pId);
    if (!product) {
      return res.status(404).json({ message: `Product with ID ${productID} does not exist.` });
    }

    const stores = getStores();
    const store = stores.find((s) => s.storeID === sId);
    if (!store) {
      return res.status(404).json({ message: `Store with ID ${storeID} does not exist.` });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        message: `Insufficient stock for ${product.name}. Available in SQLite: ${product.stock}, Requested: ${qty}`,
      });
    }

    const totalAmount = Number((product.price * qty).toFixed(2));
    const newSale = recordSaleInSqlite({
      storeID: store.storeID,
      storeName: store.name,
      productID: product.id,
      productName: product.name,
      productCategory: product.category,
      productUnitPrice: product.price,
      saleDate: saleDate || new Date().toISOString(),
                                       quantitySold: qty,
                                       totalAmount,
    });

    res.status(201).json({
      ...newSale,
      remainingStock: product.stock - qty,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to record sale in SQLite", error: error.message });
  }
});

app.delete("/api/sales/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const success = deleteSale(id);
    if (!success) {
      return res.status(404).json({ message: `Sale with ID ${id} not found.` });
    }
    res.json({ message: `Sale #${id} deleted successfully. Stock restored.` });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete sale from SQLite", error: error.message });
  }
});

// 5. Reports API
app.get("/api/reports/summary", (_req, res) => {
  try {
    const summary = getSummaryReport();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to compute report summary from SQLite", error: error.message });
  }
});

app.get("/api/reports/daily-sales", (_req, res) => {
  try {
    const list = getDailySalesAggregation();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to aggregate daily sales from SQLite", error: error.message });
  }
});

// 6. Database Management APIs
app.get("/api/database/info", (_req, res) => {
  try {
    const info = getDatabaseMetadata();
    res.json(info);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to read SQLite database metadata", error: error.message });
  }
});

app.get("/api/database/tables/:table", (req, res) => {
  try {
    const tableName = req.params.table;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const records = getTableRecords(tableName, limit, offset);
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: `Failed to fetch records from table ${req.params.table}`, error: error.message });
  }
});

app.post("/api/database/query", (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "SQL query string is required." });
    }
    const result = executeCustomQuery(query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to execute SQL query", error: error.message });
  }
});

app.get("/api/database/download", (_req, res) => {
  try {
    const dbPath = getDatabaseFilePath();
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ message: "SQLite database file does not exist yet." });
    }
    res.setHeader("Content-Disposition", 'attachment; filename="ShopSale.db"');
    res.setHeader("Content-Type", "application/x-sqlite3");
    const fileStream = fs.createReadStream(dbPath);
    fileStream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to download database file", error: error.message });
  }
});

app.post("/api/database/reset", async (_req, res) => {
  try {
    await resetDatabase();
    const info = getDatabaseMetadata();
    res.json({ message: "SQLite database ShopSale.db successfully recreated and reseeded.", info });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to reset SQLite database", error: error.message });
  }
});

// 7. C# Code Inspector API
app.get("/api/csharp-code", (req, res) => {
  const requestedFile = (req.query.file as string) || "Program.cs";
  const safePath = path.join(process.cwd(), "ShopSaleAPI", requestedFile);

  if (fs.existsSync(safePath)) {
    const content = fs.readFileSync(safePath, "utf-8");
    res.json({ file: requestedFile, content });
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

// -------------------------------------------------------------
// Server Start
// -------------------------------------------------------------
async function start() {
  try {
    await initializeSqliteDatabase();
    console.log("[Server] Persistent SQLite Database loaded successfully.");
  } catch (err) {
    console.error("[Server] Critical error initializing SQLite database:", err);
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ShopSale Management System server running at http://0.0.0.0:${PORT}`);
  });
}

start();
