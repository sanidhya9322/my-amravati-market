import React, { useEffect, useState } from "react";
import { db, storage, auth } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function Dashboard() {
  const [user] = useAuthState(auth);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Promotion Plans
  const promotionPlans = [
    { price: 49, days: 7, label: "₹49 • 7 days" },
    { price: 99, days: 15, label: "₹99 • 15 days" },
    { price: 199, days: 30, label: "₹199 • 30 days" },
  ];

  // Fetch logged-in user products
  const fetchUserProducts = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "products"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(list);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("❌ Failed to load products.");
    }
  };

  useEffect(() => {
    fetchUserProducts();
  }, [user]);

  // Delete product
  const handleDelete = async (productId, imageURL) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      if (imageURL) {
        const imageRef = ref(storage, imageURL);
        await deleteObject(imageRef);
      }
      await deleteDoc(doc(db, "products", productId));

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("✅ Product deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      toast.error("❌ Failed to delete product.");
    }
  };

  // Request Featured
  const requestFeatured = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        featuredRequest: true,
        featured: false,
      });
      toast.success("🌟 Featured request sent! Admin will review.");
      fetchUserProducts();
    } catch (err) {
      console.error("Error requesting featured:", err);
      toast.error("❌ Failed to request featured.");
    }
  };

  // Open modal for promotion
  const openPromotionModal = (productId) => {
    setSelectedProduct(productId);
    setShowModal(true);
  };

  // Confirm Promotion
  const confirmPromotion = async (plan) => {
    if (!selectedProduct) return;

    toast(
      `📢 Pay ₹${plan.price} at 💳 9322264040-2@ybl\nBoost for ${plan.days} days.`,
      { duration: 5000 }
    );

    try {
      await updateDoc(doc(db, "products", selectedProduct), {
        isPromoted: true,
        promotionPlan: plan.label,
        promotionPrice: plan.price,
        promotionExpiresAt: Timestamp.fromDate(
          new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000)
        ),
      });

      toast.success(`🚀 Promoted for ${plan.days} days!`);
      fetchUserProducts();
      setShowModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Error promoting product:", err);
      toast.error("❌ Failed to promote product.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">📦 My Dashboard</h2>
        <p className="text-gray-600 mt-1">👤 {user?.email}</p>
        <p className="text-gray-600">🧾 Total uploads: {products.length}</p>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products uploaded yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition flex flex-col"
            >
              <img
                src={product.imageURL}
                alt={product.productName}
                className="h-48 w-full object-cover rounded-t-xl"
              />
              <div className="p-4 flex-1 flex flex-col">
                <h5 className="text-lg font-semibold text-gray-800">
                  {product.productName}
                </h5>
                <p className="text-blue-600 font-bold mt-1">₹{product.price}</p>
                <p className="text-sm text-gray-600 mt-1">📍 {product.location}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>

                {/* Promotion Status */}
                {product.isPromoted &&
                product.promotionExpiresAt?.toDate() > new Date() ? (
                  <span className="mt-2 inline-block text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg">
                    🚀 Promoted till{" "}
                    {product.promotionExpiresAt.toDate().toLocaleDateString()} (
                    {product.promotionPlan})
                  </span>
                ) : (
                  <span className="mt-2 inline-block text-xs px-3 py-1 bg-gray-100 text-gray-500 rounded-lg">
                    Not Promoted
                  </span>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Link
                    to={`/edit/${product.id}`}
                    className="flex-1 px-3 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg text-center transition"
                  >
                    📝 Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.imageURL)}
                    className="flex-1 px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                  >
                    🗑️ Delete
                  </button>

                  {product.featured ? (
                    <span className="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded-lg text-center">
                      🌟 Featured
                    </span>
                  ) : product.featuredRequest ? (
                    <span className="flex-1 px-3 py-2 text-sm bg-yellow-300 text-gray-800 rounded-lg text-center">
                      ⏳ Pending Approval
                    </span>
                  ) : (
                    <button
                      onClick={() => requestFeatured(product.id)}
                      className="flex-1 px-3 py-2 text-sm border border-yellow-400 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                    >
                      ⭐ Request Featured
                    </button>
                  )}

                  <button
                    onClick={() => openPromotionModal(product.id)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    🚀 Promote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Promotion Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🚀 Choose Promotion Plan
            </h3>
            <div className="space-y-3">
              {promotionPlans.map((plan, idx) => (
                <button
                  key={idx}
                  onClick={() => confirmPromotion(plan)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {plan.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
