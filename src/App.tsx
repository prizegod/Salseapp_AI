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
import { Products } from "./pages/Products";
import { Sale } from "./pages/Sale";
import { DocScanner } from "./pages/DocScanner";
import { Reports } from "./pages/Reports";

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
              <Dashboard />
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

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
