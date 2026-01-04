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

const AdminFeaturedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH REQUESTS ================= */
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const snap = await getDocs(collection(db, "featuredRequests"));
        setRequests(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load featured requests");
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
        featured: true,
        featuredExpiresAt: Timestamp.fromDate(expires),
      });

      await deleteDoc(doc(db, "featuredRequests", req.id));

      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      toast.success("Product featured successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve request");
    }
  };

  const rejectRequest = async (id) => {
    try {
      await deleteDoc(doc(db, "featuredRequests", id));
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Request rejected");
    } catch {
      toast.error("Failed to reject request");
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return <p className="text-gray-500">Loading featured requests…</p>;
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 text-center shadow">
        <h3 className="font-semibold">No featured requests</h3>
        <p className="text-sm text-gray-500 mt-1">
          All requests have been processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">⭐ Featured Requests</h1>

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
                <td className="p-3">
                  <p className="font-semibold">
                    {req.productTitle || "Product"}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {req.productId}
                  </p>
                </td>

                <td className="p-3 text-center">
                  <p className="text-sm">{req.sellerEmail || "—"}</p>
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

export default AdminFeaturedRequests;
