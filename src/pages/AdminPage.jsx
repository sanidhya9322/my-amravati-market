// src/pages/AdminPage.jsx
import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
// UPDATED: Added useNavigate here
import { Link, useNavigate } from "react-router-dom";

/**
 * AdminPage - Full marketplace management
 * Tabs: Products | Plans | Users | Analytics
 */

export default function AdminPage() {
  // UPDATED: Initialize navigation hook
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // data
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);

  const [activeTab, setActiveTab] = useState("products");

  // filters
  const [search, setSearch] = useState("");

  // form state for plans
  const [planForm, setPlanForm] = useState({ id: null, name: "", price: "", days: "" });
  const [savingPlan, setSavingPlan] = useState(false);

  // auth & role check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRole(null);
        setLoadingAuth(false);
        return;
      }
      setUser(u);
      // load role
      try {
        const userDoc = await getDoc(doc(db, "users", u.uid));
        const r = userDoc.exists() ? userDoc.data().role || "user" : "user";
        setRole(r);
      } catch (err) {
        console.error("Failed to fetch user role", err);
        setRole("user");
      } finally {
        setLoadingAuth(false);
      }
    });
    return () => unsub();
  }, []);

  // fetch data (only if admin)
  useEffect(() => {
    if (role !== "admin") return;
    fetchAllProducts();
    fetchPlans();
    fetchUsers();
  }, [role]);

  // === Fetchers ===
  async function fetchAllProducts() {
    try {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    }
  }

  async function fetchPlans() {
    try {
      const snap = await getDocs(collection(db, "promotionPlans"));
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load plans");
    }
  }

  async function fetchUsers() {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  }

  // === Product actions ===
  async function approveProduct(productId) {
    if (!confirm("Approve this product for public visibility?")) return;
    try {
      await updateDoc(doc(db, "products", productId), { approved: true });
      toast.success("Product approved");
      fetchAllProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve");
    }
  }

  async function rejectProduct(productId) {
    if (!confirm("Reject (unpublish) this product?")) return;
    try {
      await updateDoc(doc(db, "products", productId), { approved: false });
      toast.success("Product unpublished");
      fetchAllProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to unpublish");
    }
  }

  async function togglePromotion(product) {
    try {
      if (product.promoted) {
        await updateDoc(doc(db, "products", product.id), {
          promoted: false,
          promotedAt: null,
          promotedUntil: null,
          promotionPlan: null,
        });
        toast.success("Promotion removed");
      } else {
        // simple: set promoted for 7 days (admin quick boost)
        const expires = new Date(); expires.setDate(expires.getDate() + 7);
        await updateDoc(doc(db, "products", product.id), {
          promoted: true,
          promotedAt: serverTimestamp(),
          promotedUntil: expires,
          promotionPlan: "admin-boost-7d",
        });
        toast.success("Promotion enabled (7 days)");
      }
      fetchAllProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update promotion");
    }
  }

  async function deleteProduct(product) {
    if (!confirm("Delete this product permanently?")) return;
    try {
      // delete images in storage if present (best-effort)
      if (product.imageUrls?.length) {
        for (const url of product.imageUrls) {
          try {
            const pathParts = url.split("/o/");
            if (pathParts.length > 1) {
              const after = decodeURIComponent(pathParts[1].split("?")[0]);
              await deleteObject(ref(storage, after));
            }
          } catch (err) {
            console.warn("Failed delete image", err);
          }
        }
      }

      await deleteDoc(doc(db, "products", product.id));
      toast.success("Product deleted");
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    }
  }

  // === Plans: add/update/delete ===
  function editPlan(plan) {
    setPlanForm({ id: plan.id, name: plan.name, price: plan.price, days: plan.days });
    setActiveTab("plans");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetPlanForm() {
    setPlanForm({ id: null, name: "", price: "", days: "" });
  }

  async function savePlan(e) {
    e.preventDefault();
    if (!planForm.name || !planForm.price || !planForm.days) {
      toast.error("Fill plan details");
      return;
    }
    setSavingPlan(true);
    try {
      if (planForm.id) {
        await updateDoc(doc(db, "promotionPlans", planForm.id), {
          name: planForm.name,
          price: Number(planForm.price),
          days: Number(planForm.days),
        });
        toast.success("Plan updated");
      } else {
        await addDoc(collection(db, "promotionPlans"), {
          name: planForm.name,
          price: Number(planForm.price),
          days: Number(planForm.days),
          createdAt: serverTimestamp(),
        });
        toast.success("Plan created");
      }
      resetPlanForm();
      fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save plan");
    } finally {
      setSavingPlan(false);
    }
  }

  async function removePlan(planId) {
    if (!confirm("Delete this plan?")) return;
    try {
      await deleteDoc(doc(db, "promotionPlans", planId));
      toast.success("Plan deleted");
      fetchPlans();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan");
    }
  }

  // === Users management ===
  async function updateUserRole(userId, newRole) {
    if (!confirm(`Make this user ${newRole}?`)) return;
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      toast.success("Role updated");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  }

  async function deleteUser(userId) {
    if (!confirm("Delete user doc? This will not delete auth user. Proceed?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      toast.success("User doc deleted");
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  }

  // === Analytics quick counts ===
  const analytics = {
    totalProducts: products.length,
    promoted: products.filter(p => p.promoted).length,
    pendingApproval: products.filter(p => p.approved === false || p.approved === undefined).length,
    totalPlans: plans.length,
    totalUsers: users.length
  };

  // === Render ===
  if (loadingAuth) return <p className="p-4">⏳ Checking admin access...</p>;
  if (!user) return <p className="p-4">🚫 Please login to access Admin page.</p>;
  if (role !== "admin") return <p className="p-4">🚫 Access denied. Admins only.</p>;

  return (
    <motion.div className="p-6 max-w-6xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">⚡ Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome {user.email} — Full Marketplace Management</p>
        </div>

        {/* UPDATED: Added new navigation buttons along with existing tabs */}
        <div className="flex gap-2 flex-wrap">
          <button
            className={`px-3 py-1 rounded ${activeTab === "products" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("products")}
          >Products</button>
          
          <button
            className={`px-3 py-1 rounded ${activeTab === "plans" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("plans")}
          >Plans</button>
          
          <button
            className={`px-3 py-1 rounded ${activeTab === "users" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("users")}
          >Users</button>
          
          <button
            className={`px-3 py-1 rounded ${activeTab === "analytics" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("analytics")}
          >Analytics</button>

          {/* New Page Links */}
          <button 
            className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            onClick={() => navigate("/admin/featured-requests")}
          >
            Featured Requests
          </button>

          <button 
            className="px-3 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
            onClick={() => navigate("/admin/promote-requests")}
          >
            Promote Requests
          </button>
        </div>
      </div>

      {/* ========== Products Tab ========== */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              placeholder="Search title / location / userEmail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button onClick={() => fetchAllProducts()} className="px-3 py-2 bg-gray-200 rounded">Refresh</button>
          </div>

          <div className="overflow-x-auto bg-white rounded shadow p-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Title</th>
                  <th className="p-2">Seller</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Promoted</th>
                  <th className="p-2">Approved</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.filter(p => {
                  if (!search) return true;
                  const s = search.toLowerCase();
                  return (p.title||"").toLowerCase().includes(s) ||
                         (p.location||"").toLowerCase().includes(s) ||
                         (p.userEmail||"").toLowerCase().includes(s);
                }).map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2 max-w-xs">
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-gray-500 truncate">{p.description}</div>
                      <Link to={`/product/${p.id}`} className="text-xs text-blue-600">View</Link>
                    </td>
                    <td className="p-2">{p.userEmail || "N/A"}</td>
                    <td className="p-2">₹{p.price}</td>
                    <td className="p-2">{p.category}</td>
                    <td className="p-2">{p.promoted ? "Yes" : "No"}</td>
                    <td className="p-2">{p.approved ? "Approved" : "Pending/Unapproved"}</td>
                    <td className="p-2 flex gap-2 flex-wrap">
                      {!p.approved && <button onClick={() => approveProduct(p.id)} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>}
                      {p.approved && <button onClick={() => rejectProduct(p.id)} className="px-2 py-1 bg-yellow-400 text-black rounded text-xs">Unpublish</button>}
                      <button onClick={() => togglePromotion(p)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">{p.promoted ? "Remove Promo" : "Boost (7d)"}</button>
                      <Link to={`/edit/${p.id}`} className="px-2 py-1 bg-gray-200 rounded text-xs">Edit</Link>
                      <button onClick={() => deleteProduct(p)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan="7" className="p-4 text-center text-gray-500">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== Plans Tab ========== */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <form onSubmit={savePlan} className="bg-white rounded p-4 shadow grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <input className="col-span-2 px-3 py-2 border rounded" placeholder="Plan name (e.g., 7 days)" value={planForm.name} onChange={(e) => setPlanForm({...planForm, name: e.target.value})} />
            <input className="px-3 py-2 border rounded" placeholder="Price (₹)" value={planForm.price} onChange={(e) => setPlanForm({...planForm, price: e.target.value})} />
            <input className="px-3 py-2 border rounded" placeholder="Days" value={planForm.days} onChange={(e) => setPlanForm({...planForm, days: e.target.value})} />
            <div className="flex gap-2">
              <button type="submit" disabled={savingPlan} className="px-3 py-2 bg-blue-600 text-white rounded">{planForm.id ? "Update" : "Create"}</button>
              <button type="button" onClick={resetPlanForm} className="px-3 py-2 bg-gray-200 rounded">Reset</button>
            </div>
          </form>

          <div className="bg-white rounded shadow p-3">
            <table className="w-full text-sm">
              <thead><tr><th className="p-2">Name</th><th className="p-2">Price</th><th className="p-2">Days</th><th className="p-2">Actions</th></tr></thead>
              <tbody>
                {plans.map(pl => (
                  <tr key={pl.id} className="border-t">
                    <td className="p-2">{pl.name}</td>
                    <td className="p-2">₹{pl.price}</td>
                    <td className="p-2">{pl.days}</td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => editPlan(pl)} className="px-2 py-1 bg-yellow-400 rounded text-xs">Edit</button>
                      <button onClick={() => removePlan(pl.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-500">No plans</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== Users Tab ========== */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="bg-white rounded shadow p-3">
            <table className="w-full text-sm">
              <thead><tr><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.role || 'user'}</td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => updateUserRole(u.id, "user")} className="px-2 py-1 bg-gray-200 rounded text-xs">Make User</button>
                      <button onClick={() => updateUserRole(u.id, "admin")} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Make Admin</button>
                      <button onClick={() => deleteUser(u.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Delete Doc</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-gray-500">No users</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== Analytics Tab ========== */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Total Products</div>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Promoted</div>
            <div className="text-2xl font-bold">{analytics.promoted}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Pending Approval</div>
            <div className="text-2xl font-bold">{analytics.pendingApproval}</div>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Promotion Plans</div>
            <div className="text-2xl font-bold">{analytics.totalPlans}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}