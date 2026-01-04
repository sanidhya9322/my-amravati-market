import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import toast from "react-hot-toast";

const AdminPromoteRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH REQUESTS ================= */
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const snap = await getDocs(collection(db, "promotionRequests"));
        setRequests(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load promotion requests");
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  /* ================= ACTIONS ================= */
  const approveRequest = async (req) => {
    try {
      const expires = new Date();
      expires.setDate(expires.getDate() + (req.planDays || 7));

      await updateDoc(doc(db, "products", req.productId), {
        isPromoted: true,
        promotionPlan: `${req.planDays || 7} days`,
        promotionExpiresAt: Timestamp.fromDate(expires),
      });

      await deleteDoc(doc(db, "promotionRequests", req.id));
      setRequests((prev) => prev.filter((r) => r.id !== req.id));

      toast.success("Product promoted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve promotion");
    }
  };

  const rejectRequest = async (id) => {
    try {
      await deleteDoc(doc(db, "promotionRequests", id));
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Promotion request rejected");
    } catch {
      toast.error("Failed to reject request");
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return <p className="text-gray-500">Loading promotion requests…</p>;
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 text-center shadow">
        <h3 className="font-semibold">No promotion requests</h3>
        <p className="text-sm text-gray-500 mt-1">
          All promotion requests are handled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">🚀 Promotion Requests</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3">Seller</th>
              <th className="p-3">Plan</th>
              <th className="p-3">Requested</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t">
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={req.productImage || "/placeholder.png"}
                    alt="product"
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                  />
                  <div>
                    <p className="font-semibold line-clamp-1">
                      {req.productTitle || "Product"}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {req.productId}
                    </p>
                  </div>
                </td>

                <td className="p-3 text-center text-sm">
                  {req.sellerEmail || "—"}
                </td>

                <td className="p-3 text-center">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    {req.planDays || 7} days
                  </span>
                </td>

                <td className="p-3 text-center text-xs text-gray-500">
                  {req.requestedAt?.toDate
                    ? req.requestedAt.toDate().toLocaleDateString()
                    : "—"}
                </td>

                <td className="p-3 flex gap-2 justify-center">
                  <button
                    onClick={() => approveRequest(req)}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPromoteRequests;
