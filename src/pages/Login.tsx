import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, Lock, Mail, ArrowRight, ShieldCheck, Database, FileText, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@shopsale.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      // Replace with actual authentication API call when ready:
      // await authService.login({ email, password });
      await new Promise((resolve) => setTimeout(resolve, 600));

      toast.success("Welcome back to ShopSale Management System!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    {/* Background ambient accents */}
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

    <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
    <div className="flex justify-center">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 border border-indigo-400/30">
    <Store className="w-8 h-8" />
    </div>
    </div>
    <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-white">
    ShopSale Management System
    </h2>
    <p className="mt-1.5 text-center text-xs text-slate-400">
    ASP.NET Core 6.0 Web API • SQLite EF Core • React Vite
    </p>
    </div>

    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
    <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
    <form className="space-y-5" onSubmit={handleSubmit}>
    <div>
    <label htmlFor="email" className="block text-xs font-medium text-slate-300">
    Email Address
    </label>
    <div className="mt-1.5 relative rounded-lg shadow-xs">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
    <Mail className="h-4 w-4" />
    </div>
    <input
    id="email"
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="block w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
    placeholder="admin@shopsale.com"
    />
    </div>
    </div>

    <div>
    <div className="flex items-center justify-between">
    <label htmlFor="password" className="block text-xs font-medium text-slate-300">
    Password
    </label>
    <button
    type="button"
    onClick={() => toast.info("Password reset link has been sent to demo email.")}
    className="text-xs text-indigo-400 hover:underline bg-transparent border-0 cursor-pointer"
    >
    Forgot?
    </button>
    </div>
    <div className="mt-1.5 relative rounded-lg shadow-xs">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
    <Lock className="h-4 w-4" />
    </div>
    <input
    id="password"
    type={showPassword ? "text" : "password"}
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="block w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
    placeholder="••••••••"
    />
    <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
    tabIndex={-1}
    >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
    </div>
    </div>

    <div className="flex items-center justify-between">
    <div className="flex items-center">
    <input
    id="remember-me"
    type="checkbox"
    defaultChecked
    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
    />
    <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-300 cursor-pointer">
    Remember credentials
    </label>
    </div>
    <div className="text-xs text-slate-400 font-mono">
    Demo Mode
    </div>
    </div>

    <div>
    <button
    type="submit"
    disabled={loading}
    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
    >
    {loading ? (
      <>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Signing in...</span>
      </>
    ) : (
      <>
      <span>Sign in to Dashboard</span>
      <ArrowRight className="w-4 h-4" />
      </>
    )}
    </button>
    </div>
    </form>

    {/* Quick Demo Info */}
    <div className="mt-6 pt-5 border-t border-slate-700/80">
    <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50 space-y-1.5 text-xs text-slate-400">
    <div className="flex items-center gap-2 text-indigo-300 font-medium">
    <ShieldCheck className="w-4 h-4 text-emerald-400" />
    <span>Pre-configured Environment:</span>
    </div>
    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
    <Database className="w-3 h-3 text-slate-500" />
    SQLite Seeding: Store 1 (Main Store) + Inventory
    </p>
    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
    <FileText className="w-3 h-3 text-slate-500" />
    AI Document Scanner Ready (Receipts & Invoices)
    </p>
    </div>

    <div className="mt-4 text-center">
    <span className="text-xs text-slate-400">Don't have an account? </span>
    <Link to="/signup" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
    Sign up here
    </Link>
    </div>
    </div>
    </div>
    </div>
    </div>
  );
};

export default Login;
