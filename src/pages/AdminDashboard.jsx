import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

function AdminDashboard() {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Check if user is admin from Firestore roles collection
  const checkAdminRole = async (uid) => {
    try {
      const roleRef = doc(db, "roles", uid);
      const roleSnap = await getDoc(roleRef);
      setIsAdmin(roleSnap.exists() && roleSnap.data().admin === true);
    } catch (err) {
      console.error("Error checking admin role:", err);
    }
  };

  // ✅ Fetch pending featured requests
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
    if (user) {
      checkAdminRole(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  // ✅ Approve
  const approveFeatured = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        featured: true,
        featuredRequest: false,
      });
      alert("✅ Approved & marked as Featured!");
      fetchRequests();
    } catch (err) {
      console.error("Error approving:", err);
    }
  };

  // ✅ Reject
  const rejectFeatured = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, {
        featuredRequest: false,
      });
      alert("❌ Request Rejected!");
      fetchRequests();
    } catch (err) {
      console.error("Error rejecting:", err);
    }
  };

  // ✅ UI Conditions
  if (!user) return <p>🔒 Please Log In</p>;
  if (!isAdmin) return <p>🚫 Access Denied — Admin Only</p>;

  return (
    <div className="container my-4">
      <h2>⚙️ Admin Dashboard</h2>

      {requests.length === 0 ? (
        <p>No pending featured requests 😊</p>
      ) : (
        <div className="row">
          {requests.map((product) => (
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
                  <p className="card-text" style={{ fontSize: "14px" }}>
                    {product.description}
                  </p>
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
