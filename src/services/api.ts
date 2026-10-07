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

// 🎯 1. Base URL Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Helper Functions
const getCurrentUserInfo = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

const getUserStoreId = (): number | null => {
  const user = getCurrentUserInfo();
  return user ? (user.storeId || user.id || null) : null;
};

// 2. Request Interceptor (Adds JWT Bearer Token)
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

// 3. Response Interceptor (Handles Unauthorized Errors Safely)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url?.toLowerCase() || "";
      const isLoginUrl = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");
      
      if (!isLoginUrl) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION API ====================
export const loginUser = async (credentials: { username: string; password: string }) => {
  const response = await api.post<{ token: string; user: { id: number | string; username: string; role: string; storeId?: number } }>(
    "/Auth/login",
    credentials
  );
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }
  return response.data;
};

export const registerUser = async (userData: {
  username: string;
  fullName?: string;
  storeName?: string;
  email?: string;
  password: string;
  role?: string;
}) => {
  const response = await api.post<{ message: string }>("/Auth/register", userData);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// ==================== PRODUCTS API ====================
export const getProducts = async (): Promise<Product[]> => {
  const user = getCurrentUserInfo();
  const storeId = user?.storeId || user?.id;
  const url = storeId ? `/products?storeId=${storeId}` : "/products";
  
  const response = await api.get<Product[]>(url);
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: Omit<Product, "id">): Promise<Product> => {
  const user = getCurrentUserInfo();
  const storeId = user?.storeId || user?.id || 1;
  
  const payload = {
    ...product,
    storeId: (product as any).storeId || storeId,
  };
  
  const response = await api.post<Product>("/products", payload);
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

export const getSales = async (): Promise<DailySale[]> => {
  const user = getCurrentUserInfo();
  let url = "/Sales";

  if (user?.storeId) {
    url = `/Sales?storeId=${user.storeId}`;
  } else if (user?.id) {
    url = `/Sales?queryUserId=${user.id}`;
  }

  const response = await api.get<DailySale[]>(url);
  return response.data;
};

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
  const currentStoreId = getUserStoreId() || data.storeId || 1;
  const payload: CreateSalePayload = {
    storeId: currentStoreId,
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
    timeout: 120000, // 👈 AI செயலாக்கம் முடிக்க 2 நிமிடங்கள் வரை காத்திருக்க அனுமதித்தல்
  });
  return response.data;
};
// ==================== REPORTS & ANALYTICS API ====================
export const getSummaryReport = async (): Promise<SummaryReport> => {
  const user = getCurrentUserInfo();
  const storeId = user?.storeId || user?.id;
  const url = storeId ? `/reports/summary?storeId=${storeId}` : "/reports/summary";
  const response = await api.get<SummaryReport>(url);
  return response.data;
};

export const getDailySalesRecords = async (): Promise<DailySalesRecord[]> => {
  const user = getCurrentUserInfo();
  const storeId = user?.storeId || user?.id;
  const url = storeId ? `/reports/daily-sales?storeId=${storeId}` : "/reports/daily-sales";
  const response = await api.get<DailySalesRecord[]>(url);
  return response.data;
};

// 🎯 டிரான்சாக்ஷன் ஹிஸ்டரிக்கான புதிய API
export const getRecentSalesRecords = async (): Promise<any[]> => {
  const user = getCurrentUserInfo();
  const storeId = user?.storeId || user?.id;
  const url = storeId ? `/reports/recent-sales?storeId=${storeId}` : "/reports/recent-sales";
  const response = await api.get<any[]>(url);
  return response.data;
};

// ==================== USER MANAGEMENT & DATABASE API ====================
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

export const getDatabaseDownloadUrl = (): string => `${API_BASE_URL}/database/download`;

export default api;