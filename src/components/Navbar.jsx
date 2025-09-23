import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 🔑 store role (admin / user)
  const [menuOpen, setMenuOpen] = useState(false); // ✅ mobile menu toggle
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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link to="/" className="text-xl font-bold text-blue-600">
            MyAmravati Market
          </Link>

          {/* Hamburger Menu (Mobile only) */}
          <button
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Menu Items */}
          <div
            className={`${
              menuOpen ? "flex" : "hidden"
            } sm:flex flex-col sm:flex-row sm:items-center sm:gap-3 absolute sm:static top-16 left-0 w-full sm:w-auto bg-white sm:bg-transparent shadow sm:shadow-none p-4 sm:p-0`}
          >
            {/* ✅ Categories */}
            <div className="flex flex-col sm:flex-row sm:gap-3 mb-2 sm:mb-0">
              <Link to="/category/books-notes" className="nav-link">
                📚 Books & Notes
              </Link>
              <Link to="/category/handmade-items" className="nav-link">
                🎨 Handmade
              </Link>
              <Link to="/category/homemade-food" className="nav-link">
                🍲 Food
              </Link>
              <Link to="/category/second-hand" className="nav-link">
                🔄 Second-hand
              </Link>
              <Link to="/category/new-items" className="nav-link">
                🆕 New
              </Link>
              <Link to="/category/shop" className="nav-link">
                🏪 Shop
              </Link>
            </div>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white text-sm mb-2 sm:mb-0"
                >
                  Dashboard
                </Link>

                {/* 🔑 Show only if role === "admin" */}
                {role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-500 text-sm mb-2 sm:mb-0"
                  >
                    ⚡ Admin
                  </Link>
                )}

                <span className="text-gray-700 text-sm mb-2 sm:mb-0">
                  {user.email}
                </span>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white text-sm mb-2 sm:mb-0"
                >
                  Logout
                </button>

                <Link
                  to="/favorites"
                  className="px-3 py-1 text-gray-600 hover:text-red-500 text-sm"
                >
                  ❤️ Wishlist
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white text-sm mb-2 sm:mb-0"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1 border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white text-sm"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
