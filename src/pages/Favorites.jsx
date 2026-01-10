import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { toggleFavorite } from "../utils/favorites";

const Favorites = () => {
  const [user] = useAuthState(auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ================= FETCH FAVORITES ================= */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadFavorites = async () => {
      try {
        const favSnap = await getDocs(
          collection(db, "users", user.uid, "favorites")
        );

        if (favSnap.empty) {
          setProducts([]);
          return;
        }

        // 🔹 Fetch full product data
        const productPromises = favSnap.docs.map(async (fav) => {
          const productId = fav.id;
          const productSnap = await getDocs(
            collection(db, "products")
          );
          const product = productSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .find((p) => p.id === productId);

          return product
            ? { ...product, isFavorite: true }
            : null;
        });

        const resolved = (await Promise.all(productPromises)).filter(Boolean);
        setProducts(resolved);
      } catch (err) {
        console.error("Wishlist error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user, navigate]);

  /* ================= REMOVE FAVORITE ================= */
  const handleToggleFavorite = async (productId) => {
    await toggleFavorite(productId);

    setProducts((prev) =>
      prev.filter((p) => p.id !== productId)
    );
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading wishlist…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            ❤️ My Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Products you saved for later
          </p>
        </div>

        {/* EMPTY STATE */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24 text-center">
            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
              <span className="text-4xl">💔</span>
            </div>
            <h3 className="text-lg font-semibold">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              Save products you like and find them here anytime.
            </p>

            <Link
              to="/browse"
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Favorites;
