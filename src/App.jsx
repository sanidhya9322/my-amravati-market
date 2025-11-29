// -------------------------------------------
// App.jsx (Optimized + Clean Architecture)
// -------------------------------------------
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import Browse from "./pages/Browse";
import EditProduct from "./pages/EditProduct";
import Favorites from "./pages/Favorites";
import ProductDetails from "./pages/ProductDetails";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPage from "./pages/AdminPage";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

// Hooks
import useLenis from "./hooks/useLenis";
import usePageTracking from "./hooks/usePageTracking";

// Analytics
import ReactGA from "react-ga4";

// Toast
import { Toaster } from "react-hot-toast";

// -------------------------------------------
// Initialize GA (Only once)
// -------------------------------------------
ReactGA.initialize("G-4PWTPFE8LR");

// -------------------------------------------
// Page Tracking Wrapper
// -------------------------------------------
function PageTrackingWrapper() {
  usePageTracking();
  return null;
}

// -------------------------------------------
// Main App
// -------------------------------------------
function App() {
  useLenis(); // Smooth scrolling

  return (
    <Router>
      <PageTrackingWrapper />
      <Navbar />

      {/* Global Toaster */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* User Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin-page"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;
