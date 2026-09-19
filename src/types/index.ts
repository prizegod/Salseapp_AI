export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface Store {
  storeID: number;
  name: string;
  location: string;
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
  remainingStock?: number;
}

export interface DocScanItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface DocScanResult {
  success: boolean;
  receiptNo: string;
  totalAmount: number;
  date: string;
  merchantName: string;
  taxAmount?: string;
  paymentMethod?: string;
  items: DocScanItem[];
  rawText?: string;
  confidenceScore?: number;
  fileName?: string;
  fileSize?: number;
  processedAt?: string;
}

export interface SummaryReport {
  totalRevenue: number;
  totalSalesCount: number;
  totalUnitsSold: number;
  totalProducts: number;
  lowStockAlerts: number;
}

export interface DailySalesRecord {
  date: string;
  totalSales: number;
  count: number;
  unitsSold: number;
}

export interface DatabaseTableColumn {
  name: string;
  type: string;
  pk: boolean;
}

export interface DatabaseTableInfo {
  name: string;
  rowCount: number;
  columns: DatabaseTableColumn[];
  sql: string;
}

export interface DatabaseInfo {
  fileName: string;
  filePath: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  driver: string;
  tables: DatabaseTableInfo[];
  totalRecords: number;
  lastUpdated: string;
}

export interface TableRecordsResult {
  columns: string[];
  rows: Record<string, any>[];
  total: number;
  limit: number;
  offset: number;
}

export interface SqlQueryResult {
  success: boolean;
  columns?: string[];
  rows?: Record<string, any>[];
  rowCount?: number;
  durationMs: number;
  message?: string;
  error?: string;
}
