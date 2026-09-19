import initSqlJs from "sql.js";
import type { Database as SqlDatabase } from "sql.js";
import path from "path";
import fs from "fs";

export interface StoreRow {
  storeID: number;
  name: string;
  location: string;
}

export interface ProductRow {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface DailySaleRow {
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

export interface DatabaseInfo {
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  driver: string;
  tables: {
    name: string;
    rowCount: number;
    columns: { name: string; type: string; pk: boolean }[];
    sql: string;
  }[];
  totalRecords: number;
  lastUpdated: string;
}

let dbInstance: SqlDatabase | null = null;
const DB_FILE_PATH = path.join(process.cwd(), "ShopSale.db");

/**
 * Persists current in-memory SQLite state to the physical ShopSale.db file on disk
 */
export function persistDatabase(): void {
  if (!dbInstance) return;
  const binaryArray = dbInstance.export();
  fs.writeFileSync(DB_FILE_PATH, Buffer.from(binaryArray));
}

/**
 * Helper to convert sql.js QueryExecResult to array of typed objects
 */
function rowsFromExec<T = any>(columns: string[], values: any[][]): T[] {
  return values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      // Normalize column names to camelCase if needed, or keep original
      const camelKey = col.charAt(0).toLowerCase() + col.slice(1);
      obj[col] = row[idx];
      obj[camelKey] = row[idx];
    });
    return obj as T;
  });
}

/**
 * Initialize SQLite Database engine and ensure tables + seeds exist
 */
export async function initializeSqliteDatabase(): Promise<SqlDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error("Error reading existing ShopSale.db, creating fresh:", err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Create SQLite Tables matching ASP.NET Core 6.0 EF Core schema
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS Stores (
      StoreID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Location TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Products (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Category TEXT NOT NULL,
      Price REAL NOT NULL,
      Stock INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS DailySales (
      SaleID INTEGER PRIMARY KEY AUTOINCREMENT,
      StoreID INTEGER NOT NULL,
      StoreName TEXT NOT NULL,
      ProductID INTEGER NOT NULL,
      ProductName TEXT NOT NULL,
      ProductCategory TEXT NOT NULL,
      ProductUnitPrice REAL NOT NULL,
      SaleDate TEXT NOT NULL,
      QuantitySold INTEGER NOT NULL,
      TotalAmount REAL NOT NULL,
      FOREIGN KEY (StoreID) REFERENCES Stores(StoreID),
      FOREIGN KEY (ProductID) REFERENCES Products(Id)
    );
  `);

  // Seed Stores if empty
  const storeCountRes = dbInstance.exec("SELECT COUNT(*) as count FROM Stores;");
  const storeCount = storeCountRes[0]?.values[0]?.[0] as number;
  if (!storeCount || storeCount === 0) {
    dbInstance.run(`
      INSERT INTO Stores (StoreID, Name, Location) VALUES
      (1, 'Main Store', 'Headquarters'),
      (2, 'Downtown Outlet', '450 Metro Boulevard, Suite 12'),
      (3, 'Westside Retail Plaza', '880 River Road, Bay 4');
    `);
  }

  // Seed Products if empty
  const productCountRes = dbInstance.exec("SELECT COUNT(*) as count FROM Products;");
  const productCount = productCountRes[0]?.values[0]?.[0] as number;
  if (!productCount || productCount === 0) {
    dbInstance.run(`
      INSERT INTO Products (Id, Name, Category, Price, Stock) VALUES
      (1, 'Wireless Barcode Scanner 2D', 'Hardware', 79.99, 45),
      (2, 'Thermal Receipt Paper (50pk)', 'Supplies', 34.50, 120),
      (3, 'Heavy Duty Cash Drawer RJ12', 'Hardware', 119.00, 18),
      (4, 'Touchscreen POS Terminal 15.6"', 'Systems', 549.00, 12),
      (5, 'Direct Thermal Label Printer', 'Hardware', 159.95, 28),
      (6, 'POS Cable Organizer Sleeve Kit', 'Accessories', 14.99, 85),
      (7, 'Customer Pole Display USB', 'Hardware', 89.50, 22),
      (8, 'Handheld Stock Inventory Terminal', 'Systems', 329.00, 9);
    `);
  }

  // Seed DailySales if empty
  const salesCountRes = dbInstance.exec("SELECT COUNT(*) as count FROM DailySales;");
  const salesCount = salesCountRes[0]?.values[0]?.[0] as number;
  if (!salesCount || salesCount === 0) {
    const twoDaysAgo = new Date(Date.now() - 3600000 * 24 * 2).toISOString();
    const oneDayAgo = new Date(Date.now() - 3600000 * 24).toISOString();
    const today = new Date().toISOString();

    dbInstance.run(
      `
      INSERT INTO DailySales (SaleID, StoreID, StoreName, ProductID, ProductName, ProductCategory, ProductUnitPrice, SaleDate, QuantitySold, TotalAmount) VALUES
      (1, 1, 'Main Store', 1, 'Wireless Barcode Scanner 2D', 'Hardware', 79.99, ?, 2, 159.98),
      (2, 1, 'Main Store', 2, 'Thermal Receipt Paper (50pk)', 'Supplies', 34.50, ?, 4, 138.00),
      (3, 1, 'Main Store', 3, 'Heavy Duty Cash Drawer RJ12', 'Hardware', 119.00, ?, 1, 119.00);
    `,
      [twoDaysAgo, oneDayAgo, today]
    );
  }

  // Persist to disk immediately
  persistDatabase();
  console.log(`[SQLite] ShopSale.db successfully initialized and persisted at ${DB_FILE_PATH}`);

  return dbInstance;
}

// -------------------------------------------------------------
// CRUD Operations executing pure SQLite SQL
// -------------------------------------------------------------

export function getStores(): StoreRow[] {
  if (!dbInstance) throw new Error("Database not initialized");
  const res = dbInstance.exec("SELECT StoreID as storeID, Name as name, Location as location FROM Stores ORDER BY StoreID ASC;");
  if (!res.length) return [];
  return rowsFromExec<StoreRow>(res[0].columns, res[0].values);
}

export function addStore(name: string, location: string): StoreRow {
  if (!dbInstance) throw new Error("Database not initialized");
  dbInstance.run("INSERT INTO Stores (Name, Location) VALUES (?, ?);", [name, location]);
  const lastIdRes = dbInstance.exec("SELECT last_insert_rowid() as id;");
  const id = lastIdRes[0].values[0][0] as number;
  persistDatabase();
  return { storeID: id, name, location };
}

export function getProducts(): ProductRow[] {
  if (!dbInstance) throw new Error("Database not initialized");
  const res = dbInstance.exec("SELECT Id as id, Name as name, Category as category, Price as price, Stock as stock FROM Products ORDER BY Id ASC;");
  if (!res.length) return [];
  return rowsFromExec<ProductRow>(res[0].columns, res[0].values);
}

export function getProductById(id: number): ProductRow | null {
  if (!dbInstance) throw new Error("Database not initialized");
  const res = dbInstance.exec("SELECT Id as id, Name as name, Category as category, Price as price, Stock as stock FROM Products WHERE Id = ?;", [id]);
  if (!res.length || !res[0].values.length) return null;
  return rowsFromExec<ProductRow>(res[0].columns, res[0].values)[0];
}

export function addProduct(name: string, category: string, price: number, stock: number): ProductRow {
  if (!dbInstance) throw new Error("Database not initialized");
  dbInstance.run("INSERT INTO Products (Name, Category, Price, Stock) VALUES (?, ?, ?, ?);", [name, category, price, stock]);
  const lastIdRes = dbInstance.exec("SELECT last_insert_rowid() as id;");
  const id = lastIdRes[0].values[0][0] as number;
  persistDatabase();
  return { id, name, category, price, stock };
}

export function updateProduct(id: number, updates: { name?: string; category?: string; price?: number; stock?: number }): ProductRow | null {
  if (!dbInstance) throw new Error("Database not initialized");
  const current = getProductById(id);
  if (!current) return null;

  const newName = updates.name !== undefined ? updates.name : current.name;
  const newCat = updates.category !== undefined ? updates.category : current.category;
  const newPrice = updates.price !== undefined ? updates.price : current.price;
  const newStock = updates.stock !== undefined ? updates.stock : current.stock;

  dbInstance.run("UPDATE Products SET Name = ?, Category = ?, Price = ?, Stock = ? WHERE Id = ?;", [newName, newCat, newPrice, newStock, id]);
  persistDatabase();
  return { id, name: newName, category: newCat, price: newPrice, stock: newStock };
}

export function deleteProduct(id: number, cascadeSales = true): boolean {
  if (!dbInstance) throw new Error("Database not initialized");
  if (cascadeSales) {
    dbInstance.run("DELETE FROM DailySales WHERE ProductID = ?;", [id]);
  }
  dbInstance.run("DELETE FROM Products WHERE Id = ?;", [id]);
  persistDatabase();
  return true;
}

export function deleteSale(saleId: number): boolean {
  if (!dbInstance) throw new Error("Database not initialized");
  // Restore inventory stock before removing sale
  const saleRes = dbInstance.exec("SELECT ProductID, QuantitySold FROM DailySales WHERE SaleID = ?;", [saleId]);
  if (saleRes.length && saleRes[0].values.length) {
    const prodId = saleRes[0].values[0][0] as number;
    const qty = saleRes[0].values[0][1] as number;
    dbInstance.run("UPDATE Products SET Stock = Stock + ? WHERE Id = ?;", [qty, prodId]);
  }
  dbInstance.run("DELETE FROM DailySales WHERE SaleID = ?;", [saleId]);
  persistDatabase();
  return true;
}

export function hasProductSales(productId: number): boolean {
  if (!dbInstance) throw new Error("Database not initialized");
  const res = dbInstance.exec("SELECT COUNT(*) as count FROM DailySales WHERE ProductID = ?;", [productId]);
  const count = res[0]?.values[0]?.[0] as number;
  return count > 0;
}

export function getSales(): DailySaleRow[] {
  if (!dbInstance) throw new Error("Database not initialized");
  const res = dbInstance.exec(
    "SELECT SaleID as saleID, StoreID as storeID, StoreName as storeName, ProductID as productID, ProductName as productName, ProductCategory as productCategory, ProductUnitPrice as productUnitPrice, SaleDate as saleDate, QuantitySold as quantitySold, TotalAmount as totalAmount FROM DailySales ORDER BY SaleDate DESC, SaleID DESC;"
  );
  if (!res.length) return [];
  return rowsFromExec<DailySaleRow>(res[0].columns, res[0].values);
}

export function recordSaleInSqlite(data: {
  storeID: number;
  storeName: string;
  productID: number;
  productName: string;
  productCategory: string;
  productUnitPrice: number;
  saleDate: string;
  quantitySold: number;
  totalAmount: number;
}): DailySaleRow {
  if (!dbInstance) throw new Error("Database not initialized");

  // Deduct inventory in SQLite
  dbInstance.run("UPDATE Products SET Stock = Stock - ? WHERE Id = ?;", [data.quantitySold, data.productID]);

  // Insert sale record in SQLite
  dbInstance.run(
    `INSERT INTO DailySales (StoreID, StoreName, ProductID, ProductName, ProductCategory, ProductUnitPrice, SaleDate, QuantitySold, TotalAmount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      data.storeID,
      data.storeName,
      data.productID,
      data.productName,
      data.productCategory,
      data.productUnitPrice,
      data.saleDate,
      data.quantitySold,
      data.totalAmount,
    ]
  );

  const lastIdRes = dbInstance.exec("SELECT last_insert_rowid() as id;");
  const saleId = lastIdRes[0].values[0][0] as number;

  persistDatabase();

  return {
    saleID: saleId,
    ...data,
  };
}

export function getSummaryReport() {
  if (!dbInstance) throw new Error("Database not initialized");

  const salesSummaryRes = dbInstance.exec("SELECT COUNT(*) as count, COALESCE(SUM(TotalAmount), 0) as totalRevenue, COALESCE(SUM(QuantitySold), 0) as unitsSold FROM DailySales;");
  const totalSalesCount = (salesSummaryRes[0]?.values[0]?.[0] as number) || 0;
  const totalRevenue = Number(((salesSummaryRes[0]?.values[0]?.[1] as number) || 0).toFixed(2));
  const totalUnitsSold = (salesSummaryRes[0]?.values[0]?.[2] as number) || 0;

  const productSummaryRes = dbInstance.exec("SELECT COUNT(*) as totalProducts, COALESCE(SUM(CASE WHEN Stock < 20 THEN 1 ELSE 0 END), 0) as lowStockAlerts FROM Products;");
  const totalProducts = (productSummaryRes[0]?.values[0]?.[0] as number) || 0;
  const lowStockAlerts = (productSummaryRes[0]?.values[0]?.[1] as number) || 0;

  return {
    totalRevenue,
    totalSalesCount,
    totalUnitsSold,
    totalProducts,
    lowStockAlerts,
  };
}

export function getDailySalesAggregation() {
  if (!dbInstance) throw new Error("Database not initialized");

  const res = dbInstance.exec(`
    SELECT 
      SUBSTR(SaleDate, 1, 10) as date,
      ROUND(SUM(TotalAmount), 2) as totalSales,
      COUNT(*) as count,
      SUM(QuantitySold) as unitsSold
    FROM DailySales
    GROUP BY SUBSTR(SaleDate, 1, 10)
    ORDER BY date DESC;
  `);

  if (!res.length) return [];
  return rowsFromExec<{ date: string; totalSales: number; count: number; unitsSold: number }>(res[0].columns, res[0].values);
}

/**
 * Returns comprehensive metadata about the physical SQLite database file & schema
 */
export function getDatabaseMetadata(): DatabaseInfo {
  if (!dbInstance) throw new Error("Database not initialized");

  let fileSizeBytes = 0;
  let lastUpdated = new Date().toISOString();
  if (fs.existsSync(DB_FILE_PATH)) {
    const stats = fs.statSync(DB_FILE_PATH);
    fileSizeBytes = stats.size;
    lastUpdated = stats.mtime.toISOString();
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const tablesRes = dbInstance.exec(`
    SELECT name, sql 
    FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name ASC;
  `);

  const tables: DatabaseInfo["tables"] = [];
  let totalRecords = 0;

  if (tablesRes.length > 0) {
    tablesRes[0].values.forEach(([tableName, sqlDef]) => {
      const name = tableName as string;
      const sql = (sqlDef as string) || "";

      // Get count
      const countRes = dbInstance!.exec(`SELECT COUNT(*) as cnt FROM "${name}";`);
      const rowCount = (countRes[0]?.values[0]?.[0] as number) || 0;
      totalRecords += rowCount;

      // Get columns schema via PRAGMA
      const pragmaRes = dbInstance!.exec(`PRAGMA table_info("${name}");`);
      const columns: { name: string; type: string; pk: boolean }[] = [];
      if (pragmaRes.length > 0) {
        pragmaRes[0].values.forEach((row) => {
          columns.push({
            name: row[1] as string,
            type: row[2] as string,
            pk: Boolean(row[5]),
          });
        });
      }

      tables.push({
        name,
        rowCount,
        columns,
        sql,
      });
    });
  }

  return {
    fileName: "ShopSale.db",
    filePath: DB_FILE_PATH,
    fileSizeBytes,
    fileSizeFormatted: formatSize(fileSizeBytes),
    driver: "SQLite 3 (via WebAssembly Engine)",
    tables,
    totalRecords,
    lastUpdated,
  };
}

/**
 * Execute raw SQL query against ShopSale.db
 */
export function executeCustomQuery(query: string) {
  if (!dbInstance) throw new Error("Database not initialized");
  const startTime = Date.now();

  try {
    const trimmed = query.trim();
    const isSelect = /^(SELECT|PRAGMA|EXPLAIN)/i.test(trimmed);

    if (isSelect) {
      const res = dbInstance.exec(trimmed);
      const durationMs = Date.now() - startTime;
      if (!res.length) {
        return {
          success: true,
          columns: [],
          rows: [],
          rowCount: 0,
          durationMs,
          message: "Query executed successfully. 0 rows returned.",
        };
      }
      const columns = res[0].columns;
      const rows = res[0].values.map((v) => {
        const obj: any = {};
        columns.forEach((c, idx) => {
          obj[c] = v[idx];
        });
        return obj;
      });
      return {
        success: true,
        columns,
        rows,
        rowCount: rows.length,
        durationMs,
      };
    } else {
      // DDL or DML (INSERT, UPDATE, DELETE, etc.)
      dbInstance.run(trimmed);
      persistDatabase();
      const durationMs = Date.now() - startTime;
      return {
        success: true,
        columns: [],
        rows: [],
        rowCount: 0,
        durationMs,
        message: "SQL statement executed and changes persisted to ShopSale.db.",
      };
    }
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    return {
      success: false,
      error: error?.message || "SQL syntax or execution error",
      durationMs,
    };
  }
}

/**
 * Fetch rows from a specific table with pagination
 */
export function getTableRecords(tableName: string, limit = 50, offset = 0) {
  if (!dbInstance) throw new Error("Database not initialized");

  const cleanTable = tableName.replace(/[^a-zA-Z0-9_]/g, "");
  const res = dbInstance.exec(`SELECT * FROM "${cleanTable}" LIMIT ? OFFSET ?;`, [limit, offset]);
  const countRes = dbInstance.exec(`SELECT COUNT(*) FROM "${cleanTable}";`);
  const total = (countRes[0]?.values[0]?.[0] as number) || 0;

  if (!res.length) {
    return { columns: [], rows: [], total, limit, offset };
  }

  const columns = res[0].columns;
  const rows = res[0].values.map((v) => {
    const obj: any = {};
    columns.forEach((c, idx) => {
      obj[c] = v[idx];
    });
    return obj;
  });

  return { columns, rows, total, limit, offset };
}

/**
 * Resets and re-seeds the SQLite database file
 */
export async function resetDatabase() {
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      fs.unlinkSync(DB_FILE_PATH);
    } catch (e) {
      console.warn("Could not delete file directly:", e);
    }
  }
  dbInstance = null;
  return initializeSqliteDatabase();
}

export function getDatabaseFilePath(): string {
  return DB_FILE_PATH;
}
