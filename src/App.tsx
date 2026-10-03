// @ts-nocheck
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout
import { MainLayout } from "./layouts/MainLayout";

// Pages
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { Dashboard } from "./pages/Dashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Products } from "./pages/Products";
import { Sale } from "./pages/Sale";
import { DocScanner } from "./pages/DocScanner";
import { Reports } from "./pages/Reports";
import { UserManagement } from "./pages/UserManagement";

// 🎯 Role அடிப்படையிலான Dashboard Component (All LocalStorage Fallbacks Added)
const DashboardRoute = () => {
  // 1. JSON 'user' object இருந்தால் எடுக்கிறது
  const userStr = localStorage.getItem("user");
  const userObj = userStr ? JSON.parse(userStr) : null;

  // 2. 'user_role' அல்லது 'user.role' இரண்டிலும் தேடுகிறது
  const role = userObj?.role || localStorage.getItem("user_role") || localStorage.getItem("role");

  // 3. Case-insensitive "admin" சரிபார்ப்பு
  const isAdmin = role?.toString().toLowerCase() === "admin";

  return isAdmin ? <AdminDashboard /> : <Dashboard />;
};

export default function App() {
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

      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected / App routes wrapped in MainLayout */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <DashboardRoute />
            </MainLayout>
          }
        />
        <Route
          path="/products"
          element={
            <MainLayout>
              <Products />
            </MainLayout>
          }
        />
        <Route
          path="/sales"
          element={
            <MainLayout>
              <Sale />
            </MainLayout>
          }
        />
        <Route
          path="/scanner"
          element={
            <MainLayout>
              <DocScanner />
            </MainLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <MainLayout>
              <Reports />
            </MainLayout>
          }
        />
        {/* 🎯 User Management Route (Admin-க்காகச் சேர்க்கப்பட்டுள்ளது) */}
        <Route
          path="/users"
          element={
            <MainLayout>
              <UserManagement />
            </MainLayout>
          }
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}