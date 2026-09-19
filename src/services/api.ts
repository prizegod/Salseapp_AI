import axios from "axios";
import {
  Product,
  Store,
  DailySale,
  DocScanResult,
  SummaryReport,
  DailySalesRecord,
  DatabaseInfo,
  TableRecordsResult,
  SqlQueryResult,
} from "../types";

// 1. Correct Variable Name
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://shopsale-api.onrender.com/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 2. Render Cold Start-க்காக timeout 60 seconds ஆக மாற்றப்பட்டுள்ளது
  headers: {
    "Content-Type": "application/json",
  },
});

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/products");
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  const response = await api.post<Product>("/products", product);
  return response.data;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  const response = await api.put<Product>(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/products/${id}`);
  return response.data;
};

export const getStores = async (): Promise<Store[]> => {
  const response = await api.get<Store[]>("/stores");
  return response.data;
};

export const getSales = async (): Promise<DailySale[]> => {
  const response = await api.get<DailySale[]>("/sales");
  return response.data;
};

export const recordSale = async (data: {
  storeID: number;
  productID: number;
  quantitySold: number;
  saleDate?: string;
}): Promise<DailySale> => {
  const response = await api.post<DailySale>("/sales", data);
  return response.data;
};

export const deleteSale = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/sales/${id}`);
  return response.data;
};

export const scanDocument = async (file: File): Promise<DocScanResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<DocScanResult>("/DocScanner/scan", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getSummaryReport = async (): Promise<SummaryReport> => {
  const response = await api.get<SummaryReport>("/reports/summary");
  return response.data;
};

export const getDailySalesRecords = async (): Promise<DailySalesRecord[]> => {
  const response = await api.get<DailySalesRecord[]>("/reports/daily-sales");
  return response.data;
};

export const getCSharpCode = async (fileName: string): Promise<{ file: string; content: string }> => {
  const response = await api.get<{ file: string; content: string }>(`/csharp-code?file=${encodeURIComponent(fileName)}`);
  return response.data;
};

// SQLite Database Management API
export const getDatabaseInfo = async (): Promise<DatabaseInfo> => {
  const response = await api.get<DatabaseInfo>("/database/info");
  return response.data;
};

export const getTableRecords = async (tableName: string, limit = 50, offset = 0): Promise<TableRecordsResult> => {
  const response = await api.get<TableRecordsResult>(`/database/tables/${encodeURIComponent(tableName)}?limit=${limit}&offset=${offset}`);
  return response.data;
};

export const executeSqlQuery = async (query: string): Promise<SqlQueryResult> => {
  const response = await api.post<SqlQueryResult>("/database/query", { query });
  return response.data;
};

export const resetSqliteDatabase = async (): Promise<{ message: string; info: DatabaseInfo }> => {
  const response = await api.post<{ message: string; info: DatabaseInfo }>("/database/reset");
  return response.data;
};

// 3. Render URL Updated
export const getDatabaseDownloadUrl = (): string => `${API_BASE_URL}/database/download`;

export default api;
