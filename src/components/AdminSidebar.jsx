import React from "react";
import { LogOut, ShoppingBag, Users, ClipboardList } from "lucide-react";
import { auth } from "../firebase/firebaseConfig";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const logout = async () => {
    await auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="w-64 bg-white shadow-md p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600 text-center">
        Admin Panel
      </h2>
      <button
        onClick={() => setActiveTab("products")}
        className={`flex items-center p-3 mb-2 rounded-md transition ${
          activeTab === "products"
            ? "bg-indigo-600 text-white"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        <ShoppingBag className="mr-2" size={18} /> Products
      </button>

      <button
        onClick={() => setActiveTab("users")}
        className={`flex items-center p-3 mb-2 rounded-md transition ${
          activeTab === "users"
            ? "bg-indigo-600 text-white"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        <Users className="mr-2" size={18} /> Users
      </button>

      <button
        onClick={() => setActiveTab("orders")}
        className={`flex items-center p-3 mb-2 rounded-md transition ${
          activeTab === "orders"
            ? "bg-indigo-600 text-white"
            : "hover:bg-gray-100 text-gray-700"
        }`}
      >
        <ClipboardList className="mr-2" size={18} /> Orders
      </button>

      <button
        onClick={logout}
        className="mt-auto flex items-center justify-center bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
      >
        <LogOut size={16} className="mr-2" /> Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
