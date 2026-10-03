// @ts-nocheck
import React, { useState, useEffect } from "react";
import { User, Lock, Shield, UserPlus, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { createUser } from "../services/api";

export const UserManagement: React.FC = () => {
  // லாகின் செய்த பயனரின் ரோலை LocalStorage அல்லது Auth Context-லிருந்து எடுக்கவும்
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // LocalStorage-லிருந்து role-ஐ பெறுகிறோம் (உங்கள் Auth logic-க்கு ஏற்ப மாற்றிக் கொள்ளவும்)
    const savedRole = localStorage.getItem("user_role") || "User";
    setCurrentUserRole(savedRole);

    // Default Role அமைத்தல்
    if (savedRole === "Manager") {
      setRole("User");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    // மேனேஜர் User தவிர வேறு ரோலைத் தேர்வு செய்தால் தடுப்பு
    if (currentUserRole === "Manager" && role !== "User") {
      toast.error("Managers can only create User accounts.");
      return;
    }

    setLoading(true);

    try {
      await createUser({
        username: username.trim(),
        password: password.trim(),
        role: role,
      });

      toast.success(`${role} account created successfully!`);
      setUsername("");
      setPassword("");
      setRole("User");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to create user. Permission denied.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 'User' ரோல் கொண்டவருக்கு இந்த பக்கத்தை பார்க்க அனுமதி இல்லை
  if (currentUserRole === "User") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm max-w-md">
          Standard Users do not have permission to create or manage user accounts. Please contact an Administrator or Manager.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              Create New Account
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as: <span className="text-indigo-400 font-semibold">{currentUserRole}</span>
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {currentUserRole === "Admin" ? "Full Access" : "Limited Access"}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Username
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Enter username"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Role
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Shield className="h-4 w-4" />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={currentUserRole === "Manager"} // Manager-ஆக இருந்தால் Role தேர்வு செய்ய முடியாது (User மட்டுமே)
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="User">User</option>
                {currentUserRole === "Admin" && (
                  <>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </>
                )}
              </select>
            </div>
            {currentUserRole === "Manager" && (
              <p className="text-[11px] text-amber-400/80 mt-1">
                * As a Manager, you are allowed to create 'User' accounts only.
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;