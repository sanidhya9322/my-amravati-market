import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const Favorites = () => {
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const favs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFavorites(favs);
    };

    fetchFavorites();
  }, [user]);

  return (
    <div className="container mt-4">
      <h2>Your Wishlist</h2>
      {favorites.length === 0 ? (
        <p>No items in wishlist yet.</p>
      ) : (
        <div className="row">
          {favorites.map((item) => (
            <div className="col-md-4 mb-4" key={item.id}>
              <div className="card">
                <img src={item.image} className="card-img-top" alt={item.title} />
                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>
                  <p className="card-text">₹{item.price}</p>
                  <p className="card-text"><strong>Category:</strong> {item.category}</p>
                  <p className="card-text"><strong>Location:</strong> {item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
