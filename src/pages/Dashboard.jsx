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
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";

function Dashboard() {
  const [user] = useAuthState(auth);
  const [products, setProducts] = useState([]);

  const fetchUserProducts = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "products"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchUserProducts();
  }, [user]);

  const handleDelete = async (productId, imageURL) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
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

  // ⭐ Step 1: Add requestFeatured function
  const requestFeatured = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        featuredRequest: true, // user requested
        featured: false, // not yet approved
      });
      alert("✅ Featured request sent! Admin will review it.");
    } catch (err) {
      console.error("Error requesting featured:", err);
      alert("❌ Failed to request featured.");
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
              <div className="card h-100">
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

                  <div className="d-flex gap-2">
                    <Link to={`/edit/${product.id}`} className="btn btn-warning">
                      📝 Edit
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(product.id, product.imageURL)}
                    >
                      🗑️ Delete
                    </button>

                    {/* ⭐ Request Featured button */}
                    {product.featured ? (
                      <span className="px-3 py-1 bg-green-500 text-white rounded-lg">
                        🌟 Featured
                      </span>
                    ) : product.featuredRequest ? (
                      <span className="px-3 py-1 bg-yellow-400 text-dark rounded-lg">
                        ⏳ Pending Approval
                      </span>
                    ) : (
                      <button
                        onClick={() => requestFeatured(product.id)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        ⭐ Request Featured
                      </button>
                    )}
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
