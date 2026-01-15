import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { listenToConversations } from "../utils/chatService";
import NotificationBell from "../components/NotificationBell";
// ✅ ADDED IMPORTS
import { requestPermissionAndToken } from "../firebase/messaging";
import { saveFcmToken } from "../utils/saveFcmToken";


const Navbar = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // 🔐 Auth + role + unread messages
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);

      if (currUser) {
        const snap = await getDoc(doc(db, "users", currUser.uid));
        if (snap.exists()) setRole(snap.data().role || "user");

        const unsubChats = listenToConversations(currUser.uid, (chats) => {
          const count = chats.filter(
            (c) => c.buyerUnread > 0 || c.sellerUnread > 0
          ).length;
          setUnreadCount(count);
        });

        return () => unsubChats && unsubChats();
      } else {
        setRole(null);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ ADDED: FCM Token Management
  useEffect(() => {
  if (user?.uid) {
    requestPermissionAndToken().then((token) => {
      if (token) {
        saveFcmToken(user.uid, token);
      }
    });
  }
}, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo192.png" alt="MyAmravati" className="h-8 w-8" />
          <span className="font-bold text-blue-600 text-lg">
            MyAmravati
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <Link to="/browse" className="hover:text-blue-600">
            Browse
          </Link>
          <Link
            to="/add-product"
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
          >
            Sell
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">

          {user && (
            <>
              {/* Messages (desktop only) */}
              <Link
                to="/messages"
                className="relative text-sm hover:text-blue-600 hidden sm:block"
              >
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs px-1.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Notification Bell */}
              <div className="flex items-center">
                <NotificationBell />
              </div>
            </>
          )}

          {/* User dropdown (desktop only) */}
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold"
              >
                {user.email?.charAt(0).toUpperCase()}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md text-sm overflow-hidden">
                  <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100">
                    Dashboard
                  </Link>
                  <Link to="/favorites" className="block px-4 py-2 hover:bg-gray-100">
                    Wishlist
                  </Link>
                  {role === "admin" && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <Link to="/login" className="hover:text-blue-600">
                Login
              </Link>
              <Link
                to="/signup"
                className="border border-blue-600 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-600 hover:text-white transition"
              >
                Signup
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-xl"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* 📱 Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t">
          <div className="flex flex-col text-sm divide-y">
            <Link to="/browse" onClick={() => setMenuOpen(false)} className="px-4 py-3">
              Browse
            </Link>
            <Link to="/add-product" onClick={() => setMenuOpen(false)} className="px-4 py-3">
              Sell
            </Link>

            {user && (
              <>
                <Link to="/messages" onClick={() => setMenuOpen(false)} className="px-4 py-3">
                  Messages {unreadCount > 0 && `(${unreadCount})`}
                </Link>
                <Link to="/favorites" onClick={() => setMenuOpen(false)} className="px-4 py-3">
                  Wishlist
                </Link>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="px-4 py-3">
                  Dashboard
                </Link>
                {role === "admin" && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="px-4 py-3">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 text-left text-red-600"
                >
                  Logout
                </button>
              </>
            )}

            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-3">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="px-4 py-3">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
