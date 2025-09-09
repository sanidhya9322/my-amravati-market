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

function Dashboard() {
  const [user] = useAuthState(auth);
  const [products, setProducts] = useState([]);

  // 🔹 Fetch logged-in user products
  const fetchUserProducts = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "products"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(list);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchUserProducts();
  }, [user]);

  // 🔹 Delete product
  const handleDelete = async (productId, imageURL) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      if (imageURL) {
        const imageRef = ref(storage, imageURL);
        await deleteObject(imageRef);
      }
      await deleteDoc(doc(db, "products", productId));

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      alert("✅ Product deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      alert("❌ Failed to delete the product.");
    }
  };

  // ⭐ Request Featured (Admin approval required)
  const requestFeatured = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        featuredRequest: true,
        featured: false,
      });
      alert("✅ Featured request sent! Admin will review it.");
      fetchUserProducts();
    } catch (err) {
      console.error("Error requesting featured:", err);
      alert("❌ Failed to request featured.");
    }
  };

  // 🚀 Promote to Top (Manual UPI flow)
  const handlePromote = async (productId) => {
    alert(
      "📢 To promote your product, please pay to this UPI ID:\n\n💳 9322264040-2@ybl\n\nOnce payment is done, your listing will be boosted."
    );

    const promotionDays = 7; // valid for 7 days
    try {
      await updateDoc(doc(db, "products", productId), {
        isPromoted: true,
        promotionExpiresAt: Timestamp.fromDate(
          new Date(Date.now() + promotionDays * 24 * 60 * 60 * 1000)
        ),
      });

      alert("🚀 Your product has been promoted for 7 days!");
      fetchUserProducts();
    } catch (err) {
      console.error("Error promoting product:", err);
      alert("❌ Failed to promote product.");
    }
  };

  return (
    <div className="container my-4">
      <h2>📦 My Dashboard</h2>
      <p>👤 Logged in as: {user?.email}</p>
      <p>🧾 Total uploads: {products.length}</p>

      <div className="row">
        {products.length === 0 ? (
          <p>No products uploaded yet.</p>
        ) : (
          products.map((product) => (
            <div className="col-md-4 mb-4" key={product.id}>
              <div className="card h-100 shadow-sm">
                <img
                  src={product.imageURL}
                  className="card-img-top"
                  alt={product.productName}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.productName}</h5>
                  <p className="card-text">₹{product.price}</p>
                  <p className="card-text">
                    <strong>📍</strong> {product.location}
                  </p>
                  <p className="card-text">{product.description}</p>

                  {/* 🚀 Promotion Status */}
                  {product.isPromoted &&
                  product.promotionExpiresAt?.toDate() > new Date() ? (
                    <p className="text-success fw-bold">
                      🚀 Promoted until{" "}
                      {product.promotionExpiresAt
                        .toDate()
                        .toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-muted">Not Promoted</p>
                  )}

                  <div className="d-flex gap-2 flex-wrap">
                    <Link
                      to={`/edit/${product.id}`}
                      className="btn btn-warning btn-sm"
                    >
                      📝 Edit
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(product.id, product.imageURL)
                      }
                    >
                      🗑️ Delete
                    </button>

                    {/* ⭐ Featured Flow */}
                    {product.featured ? (
                      <span className="px-3 py-1 bg-success text-white rounded">
                        🌟 Featured
                      </span>
                    ) : product.featuredRequest ? (
                      <span className="px-3 py-1 bg-warning text-dark rounded">
                        ⏳ Pending Approval
                      </span>
                    ) : (
                      <button
                        onClick={() => requestFeatured(product.id)}
                        className="btn btn-outline-warning btn-sm"
                      >
                        ⭐ Request Featured
                      </button>
                    )}

                    {/* 🚀 Promote to Top Button */}
                    <button
                      onClick={() => handlePromote(product.id)}
                      className="btn btn-primary btn-sm"
                    >
                      🚀 Promote to Top
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
