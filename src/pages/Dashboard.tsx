import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  TrendingUp,
  Package,
  AlertTriangle,
  ShoppingCart,
  ScanLine,
  ArrowRight,
  RefreshCw,
  Store,
  Layers,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { getSummaryReport, getDailySalesRecords, getSales } from "../services/api";
import { SummaryReport, DailySalesRecord, DailySale } from "../types";

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [dailySales, setDailySales] = useState<DailySalesRecord[]>([]);
  const [recentSales, setRecentSales] = useState<DailySale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sum, daily, sls] = await Promise.all([
        getSummaryReport(),
                                                  getDailySalesRecords(),
                                                  getSales(),
      ]);
      setSummary(sum);
      setDailySales(daily);
      setRecentSales(sls.slice(0, 5));
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleDbUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener("shopsale-db-updated", handleDbUpdate);
    return () => window.removeEventListener("shopsale-db-updated", handleDbUpdate);
  }, []);

  return (
    <div className="space-y-6">
    {/* Top Banner / Store Status */}
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-2xl p-6 lg:p-8 text-white shadow-lg border border-indigo-900/40 relative overflow-hidden">
    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div className="space-y-2">
    <div className="flex items-center gap-2">
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
    Active Store Terminal #01
    </span>
    <span className="text-xs text-slate-400">Main Store • Headquarters</span>
    </div>
    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
    ShopSale Overview Dashboard
    </h2>
    <p className="text-xs text-slate-300 max-w-xl">
    Enterprise retail management with ASP.NET Core 6.0 Web API, SQLite with EF Core, and AI document scanning.
    </p>
    </div>

    <div className="flex flex-wrap items-center gap-3">
    <Link
    to="/sales"
    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
    >
    <ShoppingCart className="w-4 h-4" />
    <span>Sales Terminal</span>
    </Link>
    <Link
    to="/scanner"
    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all"
    >
    <ScanLine className="w-4 h-4 text-indigo-400" />
    <span>AI Receipt Scanner</span>
    </Link>
    </div>
    </div>
    </div>

    {/* KPI Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Total Revenue */}
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
    <div>
    <p className="text-xs font-medium text-slate-500">Total Net Revenue</p>
    <h3 className="text-2xl font-black text-slate-900 mt-1">
    ₹{(summary?.totalRevenue ?? 0).toFixed(2)}
    </h3>
    <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
    <TrendingUp className="w-3 h-3" /> Live SQLite calculation
    </p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
    <IndianRupee className="w-6 h-6" />
    </div>
    </div>

    {/* Transactions */}
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
    <div>
    <p className="text-xs font-medium text-slate-500">Sales Transactions</p>
    <h3 className="text-2xl font-black text-slate-900 mt-1">
    {summary?.totalSalesCount ?? 0}
    </h3>
    <p className="text-[11px] text-slate-500 mt-1">
    {summary?.totalUnitsSold ?? 0} total units sold
    </p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
    <ShoppingCart className="w-6 h-6" />
    </div>
    </div>

    {/* Active Products */}
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
    <div>
    <p className="text-xs font-medium text-slate-500">Active Products</p>
    <h3 className="text-2xl font-black text-slate-900 mt-1">
    {summary?.totalProducts ?? 0}
    </h3>
    <p className="text-[11px] text-slate-500 mt-1">
    Catalog in Store #1
    </p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
    <Package className="w-6 h-6" />
    </div>
    </div>

    {/* Low Stock Warning */}
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
    <div>
    <p className="text-xs font-medium text-slate-500">Low Stock Alerts</p>
    <h3 className="text-2xl font-black text-amber-600 mt-1">
    {summary?.lowStockAlerts ?? 0}
    </h3>
    <p className="text-[11px] text-amber-700 font-medium mt-1">
    Items under 20 units
    </p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
    <AlertTriangle className="w-6 h-6" />
    </div>
    </div>
    </div>

    {/* Quick Action Shortcuts */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Link
    to="/sales"
    className="group bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex items-start justify-between"
    >
    <div className="space-y-1">
    <div className="flex items-center gap-2">
    <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
    <ShoppingCart className="w-4 h-4" />
    </span>
    <h4 className="text-sm font-bold text-slate-900">New Sale Entry</h4>
    </div>
    <p className="text-xs text-slate-500">
    Select product, enter quantity, update stock in real-time
    </p>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all mt-1" />
    </Link>

    <Link
    to="/scanner"
    className="group bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex items-start justify-between"
    >
    <div className="space-y-1">
    <div className="flex items-center gap-2">
    <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
    <ScanLine className="w-4 h-4" />
    </span>
    <h4 className="text-sm font-bold text-slate-900">AI Receipt Scanner</h4>
    </div>
    <p className="text-xs text-slate-500">
    Upload PDF or receipt image for automated text & invoice parsing
    </p>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all mt-1" />
    </Link>

    <Link
    to="/products"
    className="group bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex items-start justify-between"
    >
    <div className="space-y-1">
    <div className="flex items-center gap-2">
    <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
    <Package className="w-4 h-4" />
    </span>
    <h4 className="text-sm font-bold text-slate-900">Inventory Catalog</h4>
    </div>
    <p className="text-xs text-slate-500">
    Manage stock levels, price points, and retail categories
    </p>
    </div>
    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all mt-1" />
    </Link>
    </div>

    {/* Daily Sales Aggregation & Recent Activity Table */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    {/* Daily Sales Grouped History */}
    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
    <h3 className="text-sm font-bold text-slate-900">Sales Grouped By Date</h3>
    <span className="text-[11px] text-slate-500 font-medium">Daily Totals</span>
    </div>
    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
    {dailySales.length === 0 ? (
      <p className="p-6 text-center text-xs text-slate-400">No daily sales aggregated yet.</p>
    ) : (
      dailySales.map((item) => (
        <div key={item.date} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
        <div>
        <p className="text-xs font-bold text-slate-800">{item.date}</p>
        <p className="text-[11px] text-slate-400">
        {item.count} transaction{item.count !== 1 ? "s" : ""} • {item.unitsSold} units
        </p>
        </div>
        <div className="text-right">
        <span className="text-sm font-extrabold text-indigo-600">
        ₹{(item?.totalSales ?? 0).toFixed(2)}
        </span>
        </div>
        </div>
      ))
    )}
    </div>
    </div>

    {/* Recent Transactions List */}
    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
    <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
    <Link to="/sales" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
    <span>View Terminal</span>
    <ArrowRight className="w-3 h-3" />
    </Link>
    </div>

    <div className="overflow-x-auto">
    <table className="w-full text-left text-xs text-slate-600">
    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
    <tr>
    <th className="px-5 py-3">ID</th>
    <th className="px-5 py-3">Product</th>
    <th className="px-5 py-3">Quantity</th>
    <th className="px-5 py-3 text-right">Amount</th>
    </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
    {recentSales.length === 0 ? (
      <tr>
      <td colSpan={4} className="p-6 text-center text-slate-400">
      No transactions recorded yet.
      </td>
      </tr>
    ) : (
      recentSales.map((s) => (
        <tr key={s.saleID} className="hover:bg-slate-50/70">
        <td className="px-5 py-3 font-mono font-medium text-indigo-600">
        #{s.saleID}
        </td>
        <td className="px-5 py-3 font-medium text-slate-800">
        {s.productName}
        </td>
        <td className="px-5 py-3 font-semibold text-slate-700">
        {s.quantitySold}x
        </td>
        <td className="px-5 py-3 text-right font-bold text-emerald-600">
        ₹{(s?.totalAmount ?? 0).toFixed(2)}
        </td>
        </tr>
      ))
    )}
    </tbody>
    </table>
    </div>
    </div>
    </div>
    </div>
  );
};

export default Dashboard;
