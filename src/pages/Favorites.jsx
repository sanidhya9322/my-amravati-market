import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";

const Favorites = () => {
  const [user] = useAuthState(auth);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        const favRef = collection(db, "users", user.uid, "favorites");
        const snapshot = await getDocs(favRef);
        const favs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(favs);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  /* ================= UI ================= */
  return (
    <main className="max-w-7xl mx-auto px-4 py-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        ❤️ Your Wishlist
      </h1>

      {/* LOADING */}
      {loading && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && favorites.length === 0 && (
        <div className="bg-white rounded-xl p-10 shadow-sm text-center max-w-md mx-auto mt-20">
          <div className="text-5xl mb-4">💔</div>
          <h2 className="text-lg font-semibold mb-1">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 text-sm">
            Save products you like and find them easily later.
          </p>

          <Link
            to="/browse"
            className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* FAVORITES GRID */}
      {!loading && favorites.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((item) => (
            <Link
              key={item.id}
              to={`/product/${item.productId || item.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <img
                src={item.imageUrl || "/placeholder.png"}
                alt={item.title}
                className="h-44 w-full object-cover bg-gray-100"
              />

              <div className="p-4">
                <h3 className="font-semibold line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-green-600 font-bold mt-1">
                  ₹{item.price}
                </p>

                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  {item.category && (
                    <span className="bg-blue-50 px-2 py-1 rounded-full text-gray-700">
                      {item.category}
                    </span>
                  )}
                  {item.location && (
                    <span className="bg-yellow-50 px-2 py-1 rounded-full text-gray-700">
                      📍 {item.location}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default Favorites;
