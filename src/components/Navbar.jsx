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
  <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
    <img src="/logo.png" alt="MyAmravati Market" className="h-10 w-auto" />
    <div className="ml-auto d-flex align-items-center">
      {user ? (
        <>
          <Link to="/dashboard" className="btn btn-outline-primary me-2">Dashboard</Link>
          <span className="me-3">{user.email}</span>
          <button onClick={handleLogout} className="btn btn-outline-danger">Logout</button>
          <Link to="/favorites" className="nav-link">
    ❤️ Wishlist
  </Link>
        </>
      ) : (
        <>
          <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
          <Link to="/signup" className="btn btn-outline-success">Signup</Link>
        </>
      )}
    </div>
  </nav>
);

}

export default Navbar;
