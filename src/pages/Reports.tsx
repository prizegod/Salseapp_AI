import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Download,
  Printer,
  RefreshCw,
  Loader2,
  TrendingUp,
  Package,
  ShoppingBag
} from "lucide-react";
import { toast } from "react-toastify";
import { getSummaryReport, getDailySalesRecords, getSales } from "../services/api";
import { SummaryReport, DailySalesRecord, DailySale } from "../types";

export const Reports: React.FC = () => {
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [dailySales, setDailySales] = useState<DailySalesRecord[]>([]);
  const [sales, setSales] = useState<DailySale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [sum, daily, sls] = await Promise.all([
        getSummaryReport(),
                                                  getDailySalesRecords(),
                                                  getSales(),
      ]);
      setSummary(sum);
      setDailySales(daily);
      setSales(sls);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load reports data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();

    const handleDbUpdate = () => {
      loadReports();
    };
    window.addEventListener("shopsale-db-updated", handleDbUpdate);
    return () => window.removeEventListener("shopsale-db-updated", handleDbUpdate);
  }, []);

  const avgTransactionSize = useMemo(() => {
    if (!summary || summary.totalSalesCount <= 0) return 0;
    return summary.totalRevenue / summary.totalSalesCount;
  }, [summary]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (sales.length === 0) {
      toast.warning("No sales data available to export.");
      return;
    }

    // Helper to sanitize strings containing commas or quotes for CSV standard
    const escapeCSV = (val: string | number) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      "Sale ID",
      "Store Name",
      "Product Name",
      "Category",
      "Unit Price (INR)",
      "Quantity Sold",
      "Total Amount (INR)",
      "Sale Date"
    ].join(",");

    const rows = sales.map((s) =>
    [
      escapeCSV(s.saleID),
                           escapeCSV(s.storeName),
                           escapeCSV(s.productName),
                           escapeCSV(s.productCategory),
                           s.productUnitPrice,
                           s.quantitySold,
                           s.totalAmount,
                           escapeCSV(s.saleDate)
    ].join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `ShopSale_Analytics_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Sales report exported as CSV successfully!");
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
    {/* Header Banner */}
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
    <div>
    <div className="flex items-center gap-2">
    <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
    <BarChart3 className="w-5 h-5" />
    </span>
    <h2 className="text-xl font-bold text-slate-900">Analytics & Sales Reports</h2>
    </div>
    <p className="text-xs text-slate-500 mt-1">
    Auditing, sales volume aggregation, and financial summaries from SQLite database
    </p>
    </div>

    <div className="flex items-center gap-2">
    <button
    onClick={loadReports}
    disabled={loading}
    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
    title="Refresh Data"
    >
    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
    </button>
    <button
    onClick={handleExportCSV}
    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
    >
    <Download className="w-3.5 h-3.5" />
    <span>Export CSV</span>
    </button>
    <button
    onClick={handlePrint}
    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
    >
    <Printer className="w-3.5 h-3.5" />
    <span>Print Report</span>
    </button>
    </div>
    </div>

    {/* Print Title (Only visible in print view) */}
    <div className="hidden print:block mb-6">
    <h1 className="text-2xl font-bold text-slate-900">ShopSale - Sales Analytics Report</h1>
    <p className="text-xs text-slate-500">Generated on: {new Date().toLocaleString()}</p>
    </div>

    {/* Summary KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
    <div className="flex items-center justify-between text-slate-500 mb-1">
    <span className="text-xs font-medium">Gross Sales Revenue</span>
    <TrendingUp className="w-4 h-4 text-emerald-600" />
    </div>
    <h3 className="text-2xl font-black text-slate-900">
    ₹{summary?.totalRevenue?.toFixed(2) ?? "0.00"}
    </h3>
    <p className="text-[11px] text-emerald-600 mt-1">
    Across {summary?.totalSalesCount ?? 0} completed transactions
    </p>
    </div>

    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
    <div className="flex items-center justify-between text-slate-500 mb-1">
    <span className="text-xs font-medium">Total Units Distributed</span>
    <Package className="w-4 h-4 text-indigo-600" />
    </div>
    <h3 className="text-2xl font-black text-indigo-600">
    {summary?.totalUnitsSold ?? 0}
    </h3>
    <p className="text-[11px] text-slate-500 mt-1">Items sold from store inventory</p>
    </div>

    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
    <div className="flex items-center justify-between text-slate-500 mb-1">
    <span className="text-xs font-medium">Average Order Value</span>
    <ShoppingBag className="w-4 h-4 text-slate-400" />
    </div>
    <h3 className="text-2xl font-black text-slate-900">
    ₹{avgTransactionSize.toFixed(2)}
    </h3>
    <p className="text-[11px] text-slate-500 mt-1">Average yield per transaction</p>
    </div>
    </div>

    {/* Daily Sales Aggregation Table */}
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
    <div>
    <h3 className="text-sm font-bold text-slate-900">Daily Sales Aggregation</h3>
    <p className="text-xs text-slate-500">Aggregated revenue performance grouped by date</p>
    </div>
    <span className="text-[11px] font-mono px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 print:hidden">
    GET /api/reports/daily-sales
    </span>
    </div>

    <div className="overflow-x-auto">
    <table className="w-full text-left text-xs text-slate-600">
    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
    <tr>
    <th className="px-6 py-3.5">Date</th>
    <th className="px-6 py-3.5">Transactions</th>
    <th className="px-6 py-3.5">Units Sold</th>
    <th className="px-6 py-3.5 text-right">Daily Gross Revenue</th>
    </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
    {loading && dailySales.length === 0 ? (
      <tr>
      <td colSpan={4} className="p-8 text-center text-slate-400">
      <div className="flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
      <span>Loading daily sales aggregates...</span>
      </div>
      </td>
      </tr>
    ) : dailySales.length === 0 ? (
      <tr>
      <td colSpan={4} className="p-8 text-center text-slate-400">
      No aggregated sales history available.
      </td>
      </tr>
    ) : (
      dailySales.map((record) => (
        <tr key={record.date} className="hover:bg-slate-50/80 transition-colors">
        <td className="px-6 py-3.5 font-semibold text-slate-900">
        {record.date}
        </td>
        <td className="px-6 py-3.5 text-slate-700 font-medium">
        {record.count} {record.count === 1 ? "order" : "orders"}
        </td>
        <td className="px-6 py-3.5 text-slate-700">
        {record.unitsSold} units
        </td>
        <td className="px-6 py-3.5 text-right font-bold text-emerald-600 text-sm">
        ₹{record.totalSales.toFixed(2)}
        </td>
        </tr>
      ))
    )}
    </tbody>
    </table>
    </div>
    </div>
    </div>
  );
};

export default Reports;
