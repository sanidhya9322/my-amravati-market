// -------------------------------------------
// App.jsx (Clean, Fixed & Production-Ready)
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
import AdminFeaturedRequests from "./pages/AdminFeaturedRequests";
import AdminPromoteRequests from "./pages/AdminPromoteRequests";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSellerReport from "./pages/AdminSellerReport";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import ScrollToTop from "./components/ScrollToTop";

// Hooks
import useLenis from "./hooks/useLenis";
import usePageTracking from "./hooks/usePageTracking";

// Analytics
import ReactGA from "react-ga4";

// Toast
import { Toaster } from "react-hot-toast";

// -------------------------------------------
// Initialize GA (once)
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
  useLenis();

  return (
    <Router>
      {/* ✅ FIX: Scroll reset on every route change */}
      <ScrollToTop />

      <PageTrackingWrapper />

      {/* Global Navbar */}
      <Navbar />

      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1f2937",
            color: "#fff",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Messages */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

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

        {/* Admin Routes */}
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
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/seller-report"
          element={
            <AdminRoute>
              <AdminSellerReport />
            </AdminRoute>
          }
        />
        <Route
          path="/featured-requests"
          element={
            <AdminRoute>
              <AdminFeaturedRequests />
            </AdminRoute>
          }
        />
        <Route
          path="/promote-requests"
          element={
            <AdminRoute>
              <AdminPromoteRequests />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Footer */}
      <Footer />
    </Router>
  );
}

export default App;
