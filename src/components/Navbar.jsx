import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  return (
  <div className="navbar navbar-expand-lg navbar-light px-2 flex-wrap">
        <span className="navbar-brand fw-bold fs-4">MyAmravati Market</span>
        <div></div>
    <div className="ml-auto d-flex align-items-center">
      {user ? (
        <>
          <Link to="/dashboard" className="btn btn-outline-primary me-2">Dashboard</Link>
          <span className="me-3">{user.email}</span>
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm me-2">Logout</button>
          <Link to="/favorites" className="nav-link">
    ❤️ Wishlist
  </Link>
        </>
      ) : (
        <>
          <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
          <Link to="/signup" className="btn btn-outline-success">Signup</Link>        
<div className="text-center text-sm text-gray-500 py-4">
  © {new Date().getFullYear()} MyAmravati Market ·
  <Link to="/terms" className="mx-2 underline">Terms & Conditions</Link> ·
  <Link to="/privacy" className="underline">Privacy Policy</Link>
</div>

        </>
      )}
    </div>
  </div>
);

}

export default Navbar;
