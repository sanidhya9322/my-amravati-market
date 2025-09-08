import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

function AdminDashboard() {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState([]);

  // Step 1: Fetch all products with featuredRequest = true
  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "products"),
        where("featuredRequest", "==", true)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(list);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Step 2: Approve request
  const approveFeatured = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        featured: true,
        featuredRequest: false,
      });
      alert("✅ Approved & marked as Featured!");
      fetchRequests(); // refresh list
    } catch (err) {
      console.error("Error approving:", err);
      alert("❌ Failed to approve.");
    }
  };

  // Step 3: Reject request
  const rejectFeatured = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        featuredRequest: false,
      });
      alert("❌ Request rejected.");
      fetchRequests(); // refresh list
    } catch (err) {
      console.error("Error rejecting:", err);
      alert("❌ Failed to reject.");
    }
  };

  return (
    <div className="container my-4">
      <h2>⚙️ Admin Dashboard</h2>
      <p>👤 Logged in as: {user?.email}</p>

      {requests.length === 0 ? (
        <p>No featured requests at the moment.</p>
      ) : (
        <div className="row">
          {requests.map((product) => (
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
                  <p className="card-text">{product.description}</p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      onClick={() => approveFeatured(product.id)}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => rejectFeatured(product.id)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
