import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";

// ✅ Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Browse from "./pages/Browse";
import ProductDetails from "./pages/ProductDetails";
import Favorites from "./pages/Favorites";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage.jsx";
import AdminDashboard from "./pages/AdminDashboard";

// ✅ Category Pages
import BooksNotes from "./pages/BooksNotes";
import HandmadeItems from "./pages/HandmadeItems";
import HomemadeFood from "./pages/HomemadeFood";
import SecondHand from "./pages/SecondHand";
import NewItems from "./pages/NewItems";
import Shops from "./pages/Shops";

// ✅ Components & Hooks
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import useLenis from "./hooks/useLenis";

function App() {
  useLenis();

  return (
    <HelmetProvider>
      <Router>
        <Navbar />
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-page" element={<AdminPage />} />

          {/* Protected Routes */}
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

          {/* Product Details */}
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* Category Pages */}
          <Route path="/category/books-notes" element={<BooksNotes />} />
          <Route path="/category/handmade-items" element={<HandmadeItems />} />
          <Route path="/category/homemade-food" element={<HomemadeFood />} />
          <Route path="/category/second-hand" element={<SecondHand />} />
          <Route path="/category/new-items" element={<NewItems />} />
          <Route path="/category/shops" element={<Shops />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
