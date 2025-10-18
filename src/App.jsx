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
import AdminDashboard from "./pages/AdminDashboard"; // ✅ FIX: Import added
import ReactGA from "react-ga4";
ReactGA.initialize("G-4PWTPFE8LR");
import usePageTracking from "./usePageTracking";


function App() {
  usePageTracking(); // activates the tracking hook
  useLenis();

  return (
    <Router>
      <Navbar />
      {/* ✅ One global Toaster for the entire app */}
      <Toaster position="top-right" reverseOrder={false} />
 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="*" element={<NotFound />} />

        {/* ✅ FIX: Give each route a unique path */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin-page" element={<AdminPage />} />

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


export default App;
