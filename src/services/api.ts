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

// 1. Base URL with /api prefix
// 1. Base URL - Local IP Address for Mobile Capacitor App
// 🎯 IP Address-ஐ நேரடியாக வழங்கவும்
export const API_BASE_URL = "http://10.247.208.35:5000/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// 2. JWT Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor
api.interceptors.response.use(
  (response) => response,
                              (error) => {
                                if (error.response && error.response.status === 401) {
                                  const isLoginUrl = error.config?.url?.includes("/auth/login");
                                  if (!isLoginUrl) {
                                    localStorage.removeItem("token");
                                    localStorage.removeItem("user");
                                    window.location.href = "/login";
                                  }
                                }
                                return Promise.reject(error);
                              }
);

// ==================== AUTH API ====================
export const loginUser = async (credentials: { username: string; password: string }) => {
  const response = await api.post<{ token: string; user: { id: number; username: string; role: string } }>(
    "/auth/login",
    credentials
  );
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ==================== PRODUCTS API ====================
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

// ==================== STORES & SALES API ====================
export const getStores = async (): Promise<Store[]> => {
  const response = await api.get<Store[]>("/stores");
  return response.data;
};

// 🎯 Capitalized '/Sales' to match C# SalesController Route
export const getSales = async (): Promise<DailySale[]> => {
  const response = await api.get<DailySale[]>("/Sales");
  return response.data;
};

// 🎯 C# SalesController DTO-விற்கு துல்லியமாக பொருந்தும் Payload (userId நீக்கப்பட்டுள்ளது)
export interface CreateSalePayload {
  storeId: number;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
}

export const recordSale = async (data: any): Promise<any> => {
  // C# API எதிர்பார்க்கும் சரியான வடிவத்திற்கு டேட்டாவை மாற்றுகிறோம்
  const payload: CreateSalePayload = {
    storeId: data.storeId || 1, // Store ID இல்லை என்றால் Default 1
    items: data.items && data.items.length > 0
    ? data.items.map((item: any) => ({
      productId: item.productId || 1,
      name: item.name || item.productName || "Product",
      price: Number(item.price || 0),
                                     quantity: Number(item.quantity || item.quantitySold || 1)
    }))
    : [
      {
        productId: data.productId || 1,
        name: data.productName || "Product",
        price: Number(data.price || data.totalAmount || 0),
        quantity: Number(data.quantitySold || 1)
      }
    ],
    totalAmount: Number(data.totalAmount || data.price || 0)
  };

  const response = await api.post("/Sales", payload);
  return response.data;
};

export const deleteSale = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/Sales/${id}`);
  return response.data;
};

// ==================== OTHER SERVICES ====================
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
  const response = await api.get<{ file: string; content: string }>(
    `/csharp-code?file=${encodeURIComponent(fileName)}`
  );
  return response.data;
};

// ==================== SQLITE DATABASE MANAGEMENT ====================
export const getDatabaseInfo = async (): Promise<DatabaseInfo> => {
  const response = await api.get<DatabaseInfo>("/database/info");
  return response.data;
};

export const getTableRecords = async (
  tableName: string,
  limit = 50,
  offset = 0
): Promise<TableRecordsResult> => {
  const response = await api.get<TableRecordsResult>(
    `/database/tables/${encodeURIComponent(tableName)}?limit=${limit}&offset=${offset}`
  );
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

export const createUser = async (userData: { username: string; password: string; role?: string }) => {
  const response = await api.post<{ message: string }>("/users/register", userData);
  return response.data;
};

export const registerManager = async (managerData: { username: string; password: string }) => {
  const response = await api.post<{ message: string }>("/users/register-manager", managerData);
  return response.data;
};

export const createAgent = async (agentData: { username: string; password: string }) => {
  const response = await api.post<{ message: string }>("/users/create-agent", agentData);
  return response.data;
};

export const getDatabaseDownloadUrl = (): string => `${API_BASE_URL}/database/download`;

export default api;
