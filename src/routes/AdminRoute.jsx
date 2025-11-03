import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) return setIsAdmin(false);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="flex h-screen justify-center items-center text-gray-600">
        Checking permissions...
      </div>
    );
  }

  return isAdmin ? (
    children
  ) : (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-2xl text-red-600 mb-2">🚫 Access Denied</p>
      <p className="text-gray-700">Admin Only</p>
    </div>
  );
};

export default AdminRoute;
