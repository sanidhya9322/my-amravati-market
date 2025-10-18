import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Browse from './pages/Browse';
import EditProduct from './pages/EditProduct';
import NotFound from './pages/NotFound';
import Favorites from './pages/Favorites';
import useLenis from './hooks/useLenis';
import ProductDetails from './pages/ProductDetails';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { Toaster } from 'react-hot-toast';
import AdminPage from "./pages/AdminPage.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import ReactGA from "react-ga4";
import usePageTracking from "./usePageTracking";

// ✅ Initialize Google Analytics once
ReactGA.initialize("G-4PWTPFE8LR");

function App() {
  useLenis(); // smooth scrolling hook

  return (
    <Router>
      {/* ✅ Page tracking hook must be inside Router */}
      <PageTrackingWrapper />

      <Navbar />

      {/* Global toaster */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-page" element={<AdminPage />} />

        {/* Protected routes */}
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

        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>
    </Router>
  );
}

// ✅ New helper component — ensures usePageTracking runs inside Router
function PageTrackingWrapper() {
  usePageTracking();
  return null;
}

export default App;
