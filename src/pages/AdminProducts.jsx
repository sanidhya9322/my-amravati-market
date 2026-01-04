import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { CheckCircle, Clock, Star, Trash2 } from "lucide-react";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setProducts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  /* ================= ACTIONS ================= */
  const handleDelete = async (product) => {
    const ok = window.confirm(
      `⚠️ Delete "${product.title}" permanently?\nThis action cannot be undone.`
    );
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "products", product.id));
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("🗑️ Product deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleApprove = async (product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        approved: !product.approved,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, approved: !product.approved }
            : p
        )
      );
      toast.success(
        product.approved ? "Product unpublished" : "Product approved"
      );
    } catch {
      toast.error("Approval update failed");
    }
  };

  const togglePromote = async (product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        promoted: !product.promoted,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, promoted: !product.promoted }
            : p
        )
      );
      toast.success(
        product.promoted ? "Promotion removed" : "Product promoted"
      );
    } catch {
      toast.error("Promotion update failed");
    }
  };

  /* ================= FILTER ================= */
  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const s = search.toLowerCase();
    return products.filter(
      (p) =>
        p.title?.toLowerCase().includes(s) ||
        p.userEmail?.toLowerCase().includes(s) ||
        p.location?.toLowerCase().includes(s)
    );
  }, [products, search]);

  /* ================= STATS ================= */
  const stats = {
    total: products.length,
    pending: products.filter((p) => !p.approved).length,
    promoted: products.filter((p) => p.promoted).length,
  };

  /* ================= UI ================= */
  if (loading) {
    return <p className="text-gray-500">Loading products…</p>;
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">🛍️ Products Management</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title / seller / location"
          className="px-3 py-2 border rounded-lg text-sm w-full sm:w-64"
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Products" value={stats.total} />
        <StatCard label="Pending Approval" value={stats.pending} />
        <StatCard label="Promoted" value={stats.promoted} />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-gray-500">
                    {p.category} • {p.location}
                  </p>
                </td>

                <td className="p-3 text-xs">
                  {p.userEmail || "N/A"}
                </td>

                <td className="p-3 font-semibold text-green-600">
                  ₹{p.price}
                </td>

                <td className="p-3 text-xs space-x-2">
                  {!p.approved && (
                    <Badge color="yellow" icon={Clock} label="Pending" />
                  )}
                  {p.approved && (
                    <Badge color="green" icon={CheckCircle} label="Approved" />
                  )}
                  {p.promoted && (
                    <Badge color="blue" icon={Star} label="Promoted" />
                  )}
                </td>

                <td className="p-3 flex gap-2 flex-wrap">
                  <button
                    onClick={() => toggleApprove(p)}
                    className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                  >
                    {p.approved ? "Unpublish" : "Approve"}
                  </button>

                  <button
                    onClick={() => togglePromote(p)}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                  >
                    {p.promoted ? "Remove Promo" : "Promote"}
                  </button>

                  <button
                    onClick={() => handleDelete(p)}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-6 text-center text-gray-500"
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */
const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const Badge = ({ color, icon: Icon, label }) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded ${colors[color]}`}
    >
      <Icon size={12} /> {label}
    </span>
  );
};

export default AdminProducts;
