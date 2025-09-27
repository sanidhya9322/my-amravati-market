import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSocial, setShowSocial] = useState(true); // control visibility
  const navigate = useNavigate();

  let lastScrollY = window.scrollY;

  useEffect(() => {
    // Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        const userDoc = await getDoc(doc(db, "users", currUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role || "user");
        }
      } else {
        setRole(null);
      }
    });

    // Scroll listener
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        // scrolling down
        setShowSocial(false);
      } else {
        // scrolling up
        setShowSocial(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    signOut(auth);
    navigate("/");
  };

  return (
    <>
      {/* 🔝 Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo192.png"
                alt="MyAmravati Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold text-blue-600">
                MyAmravati Market
              </span>
            </Link>

            {/* Hamburger Menu */}
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

            {/* Menu */}
            <div
              className={`${
                menuOpen ? "flex" : "hidden"
              } sm:flex flex-col sm:flex-row sm:items-center sm:gap-3 absolute sm:static top-16 left-0 w-full sm:w-auto bg-white sm:bg-transparent shadow sm:shadow-none p-4 sm:p-0`}
            >
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white text-sm mb-2 sm:mb-0"
                  >
                    Dashboard
                  </Link>

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

      {/* 🔻 Content Padding */}
      <div className="pb-28">
        {/* Your page content goes here */}
      </div>

      {/* 🔻 Floating Sticky Bottom Social Bar */}
      <div
        className={`fixed left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-lg rounded-full py-2 px-6 z-40 transition-all duration-300
                    sm:bottom-6 sm:px-8 sm:py-3 xs:bottom-2 xs:px-4 xs:py-2
                    ${showSocial ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
      >
        <div className="flex justify-center gap-6 xs:gap-4">
          <a
            href="https://facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-2xl xs:text-xl"
          >
            <FaFacebook />
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 hover:text-pink-800 text-2xl xs:text-xl"
          >
            <FaInstagram />
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-600 text-2xl xs:text-xl"
          >
            <FaTwitter />
          </a>
          <a
            href="https://youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-800 text-2xl xs:text-xl"
          >
            <FaYoutube />
          </a>
        </div>
      </div>
    </>
  );
}

export default Navbar;
