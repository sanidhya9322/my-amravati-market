// src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";

// Admin layout pieces
import AdminSidebar from "../components/AdminSidebar";
import AdminDashboard from "./AdminDashboard";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminOrders from "./AdminOrders";
import AdminAnalytics from "./AdminAnalytics";
import AdminSellerReport from "./AdminSellerReport";

const AdminPage = () => {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  // 🔐 Auth + role check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setChecking(false);
        return;
      }

      setUser(u);

      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        setRole(snap.exists() ? snap.data().role : "user");
      } catch (err) {
        console.error("Admin role fetch failed", err);
        setRole("user");
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, []);

  // ⏳ Loading
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking admin access…
      </div>
    );
  }

  // 🚫 Not logged in
  if (!user) return <Navigate to="/login" />;

  // 🚫 Not admin
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Access denied. Admins only.
      </div>
    );
  }

  // 🔁 Render active admin screen
  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "products":
        return <AdminProducts />;
      case "users":
        return <AdminUsers />;
      case "orders":
        return <AdminOrders />;
      case "analytics":
        return <AdminAnalytics />;
      case "seller-report":
        return <AdminSellerReport />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <motion.div
      className="flex min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {renderActiveTab()}
      </main>
    </motion.div>
  );
};

export default AdminPage;
