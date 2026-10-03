// @ts-nocheck
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, Lock, User, ArrowRight, ShieldCheck, Database, FileText, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { loginUser } from "../services/api";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  // 🚨 முக்கிய மாற்றம்: Hardcoded "admin" மற்றும் "adminpassword"-ஐ அகற்றி "" என மாற்றவும்
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ username, password });

      // 1. பழைய Session தரவை முழுமையாக நீக்குகிறோம்
      localStorage.clear();

      // 2. புதிய லாகின் பயனர் விவரங்களைச் சேமிக்கிறோம்
      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user_id", String(response.user?.id || ""));
        localStorage.setItem("username", response.user?.username || username);
        localStorage.setItem("user_role", response.user?.role || "Agent");
      }

      toast.success(`Welcome back, ${response.user?.username || username}!`);
      
      // 3. 🚨 React Memory Refresh ஆக Hard Reload செய்து Dashboard செல்ல வேண்டும்
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Login Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Invalid username or password. Please try again.";

      toast.error(errorMessage);
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
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 border border-indigo-400/30">
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
              <label htmlFor="username" className="block text-xs font-medium text-slate-300">
                Username
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="admin"
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
                  onClick={() => toast.info("Default Admin credentials: admin / adminpassword")}
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
                Live Backend
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

          {/* Quick Info */}
          <div className="mt-6 pt-5 border-t border-slate-700/80">
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-indigo-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Backend Connected:</span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-slate-500" />
                SQLite Seeding: Store 1 & 2 + Products + Admin User
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-slate-500" />
                JWT Authentication Enabled
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