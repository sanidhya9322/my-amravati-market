// src/pages/ManagePlans.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { motion } from "framer-motion";

function ManagePlans() {
  const [plans, setPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({ name: "", price: "", days: "" });
  const [editingPlan, setEditingPlan] = useState(null);

  // ✅ Fetch all plans
  const fetchPlans = async () => {
    const snapshot = await getDocs(collection(db, "plans"));
    setPlans(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // ✅ Add new plan
  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price || !newPlan.days) {
      alert("Please fill all fields");
      return;
    }
    await addDoc(collection(db, "plans"), {
      name: newPlan.name,
      price: Number(newPlan.price),
      days: Number(newPlan.days),
    });
    setNewPlan({ name: "", price: "", days: "" });
    fetchPlans();
    alert("✅ Plan added successfully!");
  };

  // ✅ Update plan
  const handleUpdatePlan = async (planId) => {
    if (!editingPlan) return;
    await updateDoc(doc(db, "plans", planId), {
      name: editingPlan.name,
      price: Number(editingPlan.price),
      days: Number(editingPlan.days),
    });
    setEditingPlan(null);
    fetchPlans();
    alert("✅ Plan updated successfully!");
  };

  // ✅ Delete plan
  const handleDeletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    await deleteDoc(doc(db, "plans", planId));
    fetchPlans();
    alert("🗑️ Plan deleted.");
  };

  return (
    <motion.div
      className="p-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl font-bold mb-6 text-center">
        📊 Manage Promotion Plans
      </h1>

      {/* Add Plan Form */}
      <form
        onSubmit={handleAddPlan}
        className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-3"
      >
        <input
          type="text"
          placeholder="Plan Name"
          value={newPlan.name}
          onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
          className="border px-3 py-2 rounded w-full sm:w-auto"
        />
        <input
          type="number"
          placeholder="Price (₹)"
          value={newPlan.price}
          onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
          className="border px-3 py-2 rounded w-full sm:w-auto"
        />
        <input
          type="number"
          placeholder="Duration (Days)"
          value={newPlan.days}
          onChange={(e) => setNewPlan({ ...newPlan, days: e.target.value })}
          className="border px-3 py-2 rounded w-full sm:w-auto"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          ➕ Add Plan
        </button>
      </form>

      {/* Plans Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Plan Name</th>
              <th className="p-2">Price (₹)</th>
              <th className="p-2">Duration (Days)</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No plans available
                </td>
              </tr>
            ) : (
              plans.map((plan, i) => (
                <motion.tr
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b"
                >
                  <td className="p-2">
                    {editingPlan?.id === plan.id ? (
                      <input
                        type="text"
                        value={editingPlan.name}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            name: e.target.value,
                          })
                        }
                        className="border px-2 py-1 rounded"
                      />
                    ) : (
                      plan.name
                    )}
                  </td>
                  <td className="p-2">
                    {editingPlan?.id === plan.id ? (
                      <input
                        type="number"
                        value={editingPlan.price}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            price: e.target.value,
                          })
                        }
                        className="border px-2 py-1 rounded"
                      />
                    ) : (
                      `₹${plan.price}`
                    )}
                  </td>
                  <td className="p-2">
                    {editingPlan?.id === plan.id ? (
                      <input
                        type="number"
                        value={editingPlan.days}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            days: e.target.value,
                          })
                        }
                        className="border px-2 py-1 rounded"
                      />
                    ) : (
                      `${plan.days} days`
                    )}
                  </td>
                  <td className="p-2 flex gap-2">
                    {editingPlan?.id === plan.id ? (
                      <>
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                          onClick={() => handleUpdatePlan(plan.id)}
                        >
                          💾 Save
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-400 text-white rounded text-xs"
                          onClick={() => setEditingPlan(null)}
                        >
                          ❌ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
                          onClick={() => setEditingPlan(plan)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default ManagePlans;
