import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { motion } from "framer-motion";

function AdminPage() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);

  // Filters
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // ✅ Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      if (currUser) {
        setUser(currUser);
        const userDoc = await getDoc(doc(db, "users", currUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role || "user");
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Fetch products
  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // ✅ Fetch promotion plans
  const fetchPlans = async () => {
    const snapshot = await getDocs(collection(db, "promotionPlans"));
    setPlans(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    if (role === "admin") {
      fetchProducts();
      fetchPlans();
    }
  }, [role]);

  // ✅ Promote with plan
  const promoteProduct = async (productId, days) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      await updateDoc(doc(db, "products", productId), {
        promoted: true,
        promotedAt: serverTimestamp(),
        promotedUntil: expiresAt,
      });

      alert(`🚀 Product promoted for ${days} days!`);
      fetchProducts();
    } catch (err) {
      console.error("Error promoting product:", err);
    }
  };

  // ✅ Remove promotion
  const removePromotion = async (productId) => {
    try {
      await updateDoc(doc(db, "products", productId), {
        promoted: false,
        promotedUntil: null,
      });

      alert("Promotion removed.");
      fetchProducts();
    } catch (err) {
      console.error("Error removing promotion:", err);
    }
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // ✅ Filtering + Sorting
  const filteredProducts = products
    .filter((product) => {
      const locationMatch = filterLocation ? product.location === filterLocation : true;
      const categoryMatch = filterCategory ? product.category === filterCategory : true;
      const matchesTitle = product.title?.toLowerCase().includes(searchTerm.toLowerCase());
      return locationMatch && categoryMatch && matchesTitle;
    })
    .sort((a, b) => {
      if (a.promoted && !b.promoted) return -1;
      if (!a.promoted && b.promoted) return 1;
      if (a.promoted && b.promoted) {
        return (b.promotedAt?.seconds || 0) - (a.promotedAt?.seconds || 0);
      }
      if (sortOrder === "priceLowHigh") return a.price - b.price;
      if (sortOrder === "priceHighLow") return b.price - a.price;
      if (sortOrder === "newest") return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      return 0;
    });

  if (loading) return <p>⏳ Checking access...</p>;
  if (!user) return <p>🚫 Please login to access Admin page.</p>;
  if (role !== "admin") return <p>🚫 Access denied. Admins only.</p>;

  return (
    <motion.div
      className="p-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl font-bold mb-6 text-center">⚡ Admin Dashboard</h1>
      <p className="text-center mb-6">Welcome {user.email}, you have admin access!</p>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="🔍 Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full"
        />
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full"
        >
          <option value="">All Locations</option>
          {["Amravati","Achalpur","Anjangaon Surji","Bhatkuli","Chandur Bazar",
            "Chandur Railway","Chikhaldara","Warud","Dhamangaon Railway","Dharni",
            "Daryapur","Morshi","Nandgaon Khandeshwar","Teosa","Anjangaon"
          ].map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full"
        >
          <option value="">All Categories</option>
          {["Books & Notes","Handmade Items","Homemade Food","Second-hand Items","New Items"].map(
            (cat) => (
              <option key={cat} value={cat}>{cat}</option>
            )
          )}
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full"
        >
          <option value="newest">Newest First</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Title</th>
              <th className="p-2">Price</th>
              <th className="p-2">Category</th>
              <th className="p-2">Location</th>
              <th className="p-2">Seller</th>
              <th className="p-2">Promotion</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b"
                >
                  <td className="p-2">{product.title}</td>
                  <td className="p-2">₹{product.price}</td>
                  <td className="p-2">{product.category}</td>
                  <td className="p-2">{product.location}</td>
                  <td className="p-2">{product.sellerPhone || "N/A"}</td>
                  <td className="p-2">
                    {product.promoted ? (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                        Active until{" "}
                        {product.promotedUntil
                          ? new Date(product.promotedUntil.seconds * 1000).toLocaleDateString()
                          : "N/A"}
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                        Not Promoted
                      </span>
                    )}
                  </td>
                  <td className="p-2 flex flex-col gap-2">
                    {product.promoted ? (
                      <button
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
                        onClick={() => removePromotion(product.id)}
                      >
                        Remove Promotion
                      </button>
                    ) : (
                      plans.map((plan) => (
                        <button
                          key={plan.id}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                          onClick={() => promoteProduct(product.id, plan.days)}
                        >
                          Promote ({plan.name} – ₹{plan.price})
                        </button>
                      ))
                    )}
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
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

export default AdminPage;
