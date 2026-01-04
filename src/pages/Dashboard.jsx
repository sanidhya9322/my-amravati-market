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

const promotionPlans = [
  { price: 49, days: 7, label: "₹49 • 7 days" },
  { price: 99, days: 15, label: "₹99 • 15 days" },
  { price: 199, days: 30, label: "₹199 • 30 days" },
];

function Dashboard() {
  const [user] = useAuthState(auth);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH PRODUCTS ---------------- */
  const fetchUserProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "products"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setProducts(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProducts();
  }, [user]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (product) => {
    if (!window.confirm("Delete this product permanently?")) return;

    try {
      if (product.imageUrls?.[0]) {
        await deleteObject(ref(storage, product.imageUrls[0]));
      }
      await deleteDoc(doc(db, "products", product.id));
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  /* ---------------- FEATURE REQUEST ---------------- */
  const requestFeatured = async (productId) => {
    try {
      await updateDoc(doc(db, "products", productId), {
        featuredRequest: true,
        featured: false,
      });
      toast.success("Featured request sent");
      fetchUserProducts();
    } catch {
      toast.error("Failed to request featured");
    }
  };

  /* ---------------- PROMOTION ---------------- */
  const confirmPromotion = async (plan) => {
    try {
      await updateDoc(doc(db, "products", selectedProduct), {
        isPromoted: true,
        promotionPlan: plan.label,
        promotionPrice: plan.price,
        promotionExpiresAt: Timestamp.fromDate(
          new Date(Date.now() + plan.days * 86400000)
        ),
      });
      toast.success(`Promoted for ${plan.days} days`);
      fetchUserProducts();
    } catch {
      toast.error("Promotion failed");
    } finally {
      setShowModal(false);
      setSelectedProduct(null);
    }
  };

  /* ================= UI ================= */
  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">📦 My Dashboard</h1>
        <p className="text-gray-600 mt-1">{user?.email}</p>
        <p className="text-sm text-gray-500 mt-1">
          Total products: {products.length}
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && products.length === 0 && (
        <div className="text-center bg-white rounded-xl p-10 shadow-sm">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-lg font-semibold">No products yet</h2>
          <p className="text-gray-500 mt-1">
            Start selling by adding your first product.
          </p>
          <Link
            to="/add-product"
            className="inline-block mt-5 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
          >
            ➕ Add Product
          </Link>
        </div>
      )}

      {/* PRODUCTS GRID */}
      {!loading && products.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isActivePromotion =
              product.isPromoted &&
              product.promotionExpiresAt?.toDate() > new Date();

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col"
              >
                <img
                  src={product.imageUrls?.[0] || "/placeholder.png"}
                  alt={product.title}
                  className="h-48 w-full object-cover rounded-t-xl"
                />

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-green-600 font-bold mt-1">
                    ₹{product.price}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {product.location}
                  </p>

                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  {/* STATUS */}
                  <div className="mt-3">
                    {isActivePromotion ? (
                      <span className="inline-block text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                        🚀 Promoted till{" "}
                        {product.promotionExpiresAt
                          .toDate()
                          .toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="inline-block text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                        Not promoted
                      </span>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Link
                      to={`/edit/${product.id}`}
                      className="text-center bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-lg text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm"
                    >
                      Delete
                    </button>

                    {product.featured ? (
                      <span className="col-span-2 text-center bg-green-500 text-white py-2 rounded-lg text-sm">
                        🌟 Featured
                      </span>
                    ) : product.featuredRequest ? (
                      <span className="col-span-2 text-center bg-yellow-200 text-gray-800 py-2 rounded-lg text-sm">
                        ⏳ Featured pending
                      </span>
                    ) : (
                      <button
                        onClick={() => requestFeatured(product.id)}
                        className="col-span-2 border border-yellow-400 text-yellow-600 hover:bg-yellow-50 py-2 rounded-lg text-sm"
                      >
                        ⭐ Request Featured
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedProduct(product.id);
                        setShowModal(true);
                      }}
                      className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
                    >
                      🚀 Promote Product
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PROMOTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80">
            <h3 className="font-semibold text-lg mb-4">
              Choose Promotion Plan
            </h3>

            <div className="space-y-3">
              {promotionPlans.map((plan) => (
                <button
                  key={plan.label}
                  onClick={() => confirmPromotion(plan)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  {plan.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;