import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, Lock, Mail, User, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [storeLocation, setStoreLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim() || !storeLocation.trim()) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Simulate API authentication and registration request delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Store initial user info in local session cache
      localStorage.setItem("shopsale_user_name", name.trim());
      localStorage.setItem("shopsale_user_email", email.trim());
      localStorage.setItem("shopsale_store_location", storeLocation.trim());

      toast.success("Account created successfully! Welcome to ShopSale.");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
    {/* Background glow overlay */}
    <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

    <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
    <div className="flex justify-center">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 border border-indigo-400/30">
    <Store className="w-8 h-8" />
    </div>
    </div>
    <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-white">
    Register Store Account
    </h2>
    <p className="mt-1.5 text-center text-xs text-slate-400">
    Join the ShopSale Management System
    </p>
    </div>

    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
    <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
    <form className="space-y-4" onSubmit={handleSubmit}>
    {/* Full Name Input */}
    <div>
    <label className="block text-xs font-medium text-slate-300">
    Full Name
    </label>
    <div className="mt-1.5 relative rounded-lg shadow-xs">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
    <User className="h-4 w-4" />
    </div>
    <input
    type="text"
    required
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="block w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
    placeholder="Alex Mercer"
    />
    </div>
    </div>

    {/* Store Location Input */}
    <div>
    <label className="block text-xs font-medium text-slate-300">
    Default Store Location
    </label>
    <div className="mt-1.5 relative rounded-lg shadow-xs">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
    <MapPin className="h-4 w-4" />
    </div>
    <input
    type="text"
    required
    value={storeLocation}
    onChange={(e) => setStoreLocation(e.target.value)}
    className="block w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
    placeholder="Main Store - Headquarters"
    />
    </div>
    </div>

    {/* Email Input */}
    <div>
    <label className="block text-xs font-medium text-slate-300">
    Work Email
    </label>
    <div className="mt-1.5 relative rounded-lg shadow-xs">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
    <Mail className="h-4 w-4" />
    </div>
    <input
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="block w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
    placeholder="alex@shopsale.com"
    />
    </div>
    </div>

    {/* Password Input */}
    <div>
    <label className="block text-xs font-medium text-slate-300">
    Password
    </label>
    <div className="mt-1.5 relative rounded-lg shadow-xs">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
    <Lock className="h-4 w-4" />
    </div>
    <input
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="block w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
    placeholder="••••••••"
    />
    </div>
    </div>

    {/* Submit Button */}
    <div className="pt-2">
    <button
    type="submit"
    disabled={loading}
    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-60"
    >
    {loading ? (
      <>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Creating Account...</span>
      </>
    ) : (
      <>
      <span>Create Account</span>
      <ArrowRight className="w-4 h-4" />
      </>
    )}
    </button>
    </div>
    </form>

    <div className="mt-6 text-center border-t border-slate-700/80 pt-4">
    <span className="text-xs text-slate-400">Already registered? </span>
    <Link to="/" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
    Sign in to your account
    </Link>
    </div>
    </div>
    </div>
    </div>
  );
};

export default SignUp;
