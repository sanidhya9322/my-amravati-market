import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const Favorites = () => {
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        // ✅ Correct path: users/{uid}/favorites
        const favRef = collection(db, `users/${user.uid}/favorites`);
        const snapshot = await getDocs(favRef);
        const favs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(favs);
      } catch (error) {
        console.error("❌ Error fetching favorites:", error);
      }
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
