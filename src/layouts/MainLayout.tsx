import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  ScanLine,
  Package,
  BarChart3,
  Store,
  LogOut,
  Code2,
  Bell,
  Menu,
  X,
  ChevronRight,
  Database,
  Sparkles
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CSharpCodeModal } from "../components/CSharpCodeModal";
import { SQLiteDatabaseModal } from "../components/SQLiteDatabaseModal";

interface MainLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sales", label: "Sales Entry", icon: ShoppingCart, badge: "Core" },
  { path: "/scanner", label: "AI Doc Scanner", icon: ScanLine, highlight: true },
  { path: "/products", label: "Products", icon: Package },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans antialiased">
      {/* C# Code Inspector Modal */}
      <CSharpCodeModal isOpen={showCodeModal} onClose={() => setShowCodeModal(false)} />

      {/* SQLite Database Explorer & Query Console Modal */}
      <SQLiteDatabaseModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
        onDataChanged={() => window.dispatchEvent(new CustomEvent("shopsale-db-updated"))}
      />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } border-r border-slate-800`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                ShopSale
                <span className="text-[10px] uppercase font-semibold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  POS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Management System</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Store Badge */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Main Store (ID: 1)</p>
                <p className="text-[11px] text-slate-400">Headquarters • SQLite EF</p>
              </div>
            </div>
            <Database className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.highlight ? "text-indigo-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-[10px] font-semibold bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
                {item.badge && !isActive && (
                  <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Developer & Architecture
          </div>

          <button
            onClick={() => setShowDbModal(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-emerald-300/90 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-left mb-1.5"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>SQLite Database</span>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ShopSale.db
            </span>
          </button>

          <button
            onClick={() => setShowCodeModal(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-amber-300/90 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>.NET 6.0 & EF Core Code</span>
            </div>
            <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">
              C#
            </span>
          </button>
        </nav>

        {/* Sidebar Footer / User Profile */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-slate-900 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
                AD
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-slate-200 truncate">Store Manager</p>
                <p className="text-[10px] text-slate-400 truncate">admin@shopsale.com</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-semibold text-slate-900 capitalize">
                {location.pathname === "/sales"
                  ? "Sales Entry & Transactions"
                  : location.pathname === "/scanner"
                  ? "AI Document Scanner"
                  : location.pathname.replace("/", "") || "Dashboard"}
              </h1>
              <span className="hidden sm:inline-block text-xs font-medium text-slate-400">•</span>
              <span className="hidden sm:inline-block text-xs text-slate-500">
                Connected to SQLite EF Core API
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDbModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 transition-colors shadow-2xs"
              title="Open SQLite Database Inspector & SQL Console"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQLite (ShopSale.db)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </button>

            <button
              onClick={() => setShowCodeModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300/80 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>View ASP.NET Core Code</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <button
              title="Notifications"
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
