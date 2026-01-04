import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snap = await getDocs(collection(db, "orders"));
        setOrders(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  /* ================= FILTER ================= */
  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const s = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.buyerEmail?.toLowerCase().includes(s) ||
        o.productTitle?.toLowerCase().includes(s)
    );
  }, [orders, search]);

  /* ================= UI ================= */
  if (loading) {
    return <p className="text-gray-500">Loading orders…</p>;
  }

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">📦 Orders</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search buyer / product"
          className="px-3 py-2 border rounded-lg text-sm w-full sm:w-64"
        />
      </div>

      {/* EMPTY STATE */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
          No orders found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              {/* LEFT */}
              <div>
                <p className="font-semibold">
                  {order.productTitle || "Unknown product"}
                </p>
                <p className="text-sm text-gray-500">
                  Buyer: {order.buyerEmail || "N/A"}
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />

                {order.createdAt?.toDate && (
                  <span className="text-xs text-gray-400">
                    {order.createdAt.toDate().toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================= SMALL COMPONENT ================= */
const StatusBadge = ({ status }) => {
  if (status === "completed") {
    return (
      <Badge
        icon={CheckCircle}
        color="green"
        label="Completed"
      />
    );
  }

  if (status === "cancelled") {
    return (
      <Badge
        icon={XCircle}
        color="red"
        label="Cancelled"
      />
    );
  }

  return (
    <Badge
      icon={Clock}
      color="yellow"
      label="Pending"
    />
  );
};

const Badge = ({ icon: Icon, color, label }) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colors[color]}`}
    >
      <Icon size={14} />
      {label}
    </span>
  );
};

export default AdminOrders;
