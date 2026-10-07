import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout
import { MainLayout } from "./layouts/MainLayout";

// Security Component
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages (Standard Imports)
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Products } from "./pages/Products";
import { Sale } from "./pages/Sale";
import { Reports } from "./pages/Reports";
import { UserManagement } from "./pages/UserManagement";

// 🎯 DocScanner-ஐ எரர் இல்லாமல் லோட் செய்ய Lazy Import
const DocScanner = lazy(() => import("./pages/DocScanner"));

// 🎯 Role அடிப்படையிலான Dashboard Component
const DashboardRoute = () => {
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;
  const role = userObj?.role || localStorage.getItem("user_role") || localStorage.getItem("role");
  const isAdmin = role?.toString().toLowerCase() === "admin";

  return isAdmin ? <AdminDashboard /> : <Dashboard />;
};

export function App() {
  return (
    <BrowserRouter>
      {/* Global Toast Container */}
      <ToastContainer
        aria-label="Notifications"
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Suspense
        fallback={
          <div className="min-h-screen bg-[#18181B] flex items-center justify-center text-[#F59E0B]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F59E0B]" />
          </div>
        }
      >
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* 🔒 Protected Routes */}
          
          {/* 1. General Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DashboardRoute />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 2. 🎯 Admin Dedicated Dashboard Route (Login.tsx-லிருந்து வரும் navigate('/admin-dashboard') -க்காகச் சேர்க்கப்பட்டது) */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 3. Products Page */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Products />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 4. Sales Page */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Sale />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 5. Document Scanner */}
          <Route
            path="/scanner"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DocScanner />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 6. Reports */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* 7. User Management */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <MainLayout>
                  <UserManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;