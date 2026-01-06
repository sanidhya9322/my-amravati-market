import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminOrders from "./AdminOrders";
import AdminAnalytics from "./AdminAnalytics";
import AdminSellerReport from "./AdminSellerReport";

import { db, auth } from "../firebase/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import {
  Package,
  User,
  ShoppingCart,
} from "lucide-react";

/* ===============================
   ADMIN DASHBOARD (PROTECTED)
================================ */
const AdminDashboard = () => {
  const [role, setRole] = useState(null); // ✅ real role
  const [checkingRole, setCheckingRole] = useState(true);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  /* ================= ROLE CHECK ================= */
  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setRole("guest");
          return;
        }

        const snap = await getDoc(doc(db, "users", user.uid));
        setRole(snap.exists() ? snap.data().role : "user");
      } catch (err) {
        console.error("Role fetch failed:", err);
        setRole("user");
      } finally {
        setCheckingRole(false);
      }
    };

    checkRole();
  }, []);

  /* ================= FETCH STATS ================= */
  useEffect(() => {
    if (role !== "admin") return;

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const [productsSnap, usersSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "users")),
          getDocs(collection(db, "orders")),
        ]);

        setStats({
          totalProducts: productsSnap.size,
          totalUsers: usersSnap.size,
          totalOrders: ordersSnap.size,
        });
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [role]);

  /* ================= LOADING ================= */
  if (checkingRole) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        ⏳ Verifying admin access...
      </div>
    );
  }

  /* ================= ACCESS DENIED ================= */
  if (role !== "admin") {
    return (
      <div className="h-screen flex items-center justify-center text-red-600 font-semibold">
        🚫 Access Denied — Admins only
      </div>
    );
  }

  /* ================= TAB RENDER ================= */
  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return renderOverview();
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
        return renderOverview();
    }
  };

  /* ================= OVERVIEW ================= */
  const renderOverview = () => (
    <>
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        🧠 MyAmravati Market — Admin Dashboard
      </h1>

      {loadingStats ? (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
          Loading statistics...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.totalProducts}
            color="text-indigo-600"
          />
          <StatCard
            icon={User}
            label="Total Users"
            value={stats.totalUsers}
            color="text-green-600"
          />
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={stats.totalOrders}
            color="text-pink-600"
          />
        </div>
      )}
    </>
  );

  /* ================= UI ================= */
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 p-6 overflow-y-auto">
        {renderTab()}
      </main>
    </div>
  );
};

/* ================= STAT CARD ================= */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
    <div className="flex items-center">
      <Icon className={`${color} mr-3`} size={26} />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h2 className="text-2xl font-semibold">{value}</h2>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
