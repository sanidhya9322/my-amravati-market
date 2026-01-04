import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminOrders from "./AdminOrders";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
  Package,
  User,
  ShoppingCart,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  /* ================= FETCH STATS ================= */
  useEffect(() => {
    const fetchStats = async () => {
      try {
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
  }, []);

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
        return (
          <div className="bg-white p-6 rounded-xl shadow text-gray-600">
            📊 Analytics page coming soon
          </div>
        );
      case "seller-report":
        return (
          <div className="bg-white p-6 rounded-xl shadow text-gray-600">
            🚨 Seller reports page coming soon
          </div>
        );
      default:
        return <AdminProducts />;
    }
  };

  /* ================= OVERVIEW ================= */
  const renderOverview = () => (
    <>
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        🧠 MyAmravati Market — Admin Dashboard
      </h1>

      {loadingStats ? (
        <p className="text-gray-500">Loading statistics…</p>
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
