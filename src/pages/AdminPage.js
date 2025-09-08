import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function AdminPage() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>⏳ Checking access...</p>;

  if (!user) {
    return <p>🚫 Please login to access Admin page.</p>;
  }

  if (role !== "admin") {
    return <p>🚫 Access denied. Admins only.</p>;
  }

  return (
    <div>
      <h1>⚡ Admin Dashboard</h1>
      <p>Welcome {user.email}, you have admin access!</p>
      {/* ✅ Place your admin-only controls here */}
    </div>
  );
}

export default AdminPage;
