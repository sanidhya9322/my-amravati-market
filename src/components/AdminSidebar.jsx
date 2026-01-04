import React from "react";
import {
  LogOut,
  ShoppingBag,
  Users,
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  AlertTriangle,
} from "lucide-react";
import { auth } from "../firebase/firebaseConfig";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const logout = async () => {
    await auth.signOut();
    window.location.href = "/";
  };

  const Item = ({ tab, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
        activeTab === tab
          ? "bg-indigo-600 text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-5 border-b">
        <h2 className="text-xl font-bold text-indigo-600">
          Admin Panel
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          MyAmravati Market
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-1">
        <Item
          tab="dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
        />
        <Item
          tab="products"
          icon={ShoppingBag}
          label="Products"
        />
        <Item
          tab="users"
          icon={Users}
          label="Users"
        />
        <Item
          tab="orders"
          icon={ClipboardList}
          label="Orders"
        />
        <Item
          tab="seller-report"
          icon={AlertTriangle}
          label="Seller Reports"
        />
        <Item
          tab="analytics"
          icon={BarChart3}
          label="Analytics"
        />
      </div>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
