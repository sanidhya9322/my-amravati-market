import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 🔑 store role (admin / user)
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        // ✅ Fetch role from Firestore
        const userDoc = await getDoc(doc(db, "users", currUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role || "user");
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    navigate("/");
  };

  return (
    <div className="navbar navbar-expand-lg navbar-light px-2 flex-wrap">
      <span className="navbar-brand fw-bold fs-4">MyAmravati Market</span>
      <div></div>
      <div className="ml-auto d-flex align-items-center">
        {user ? (
          <>
            <Link to="/dashboard" className="btn btn-outline-primary me-2">
              Dashboard
            </Link>

            {/* 🔑 Show only if role === "admin" */}
            {role === "admin" && (
              <Link to="/admin" className="btn btn-warning me-2">
                ⚡ Admin
              </Link>
            )}

            <span className="me-3">{user.email}</span>
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm me-2"
            >
              Logout
            </button>
            <Link to="/favorites" className="nav-link">
              ❤️ Wishlist
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline-primary me-2">
              Login
            </Link>
            <Link to="/signup" className="btn btn-outline-success">
              Signup
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
