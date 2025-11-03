import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminOrders from "./AdminOrders";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Package, User, ShoppingCart } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
  });

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
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
    };

    fetchStats();
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "products":
        return <AdminProducts />;
      case "users":
        return <AdminUsers />;
      case "orders":
        return <AdminOrders />;
      default:
        return <AdminProducts />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Analytics Overview */}
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">
          🧠 MyAmravati Market Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex items-center">
              <Package className="text-indigo-600 mr-3" size={26} />
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <h2 className="text-2xl font-semibold">{stats.totalProducts}</h2>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex items-center">
              <User className="text-green-600 mr-3" size={26} />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <h2 className="text-2xl font-semibold">{stats.totalUsers}</h2>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex items-center">
              <ShoppingCart className="text-pink-600 mr-3" size={26} />
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <h2 className="text-2xl font-semibold">{stats.totalOrders}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tab Area */}
        {renderTab()}
      </div>
    </div>
  );
};

export default AdminDashboard;
