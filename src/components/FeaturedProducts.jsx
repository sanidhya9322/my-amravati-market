import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Memory leak se bachne ke liye cleanup flag

    const fetchFeatured = async () => {
      try {
        // NOTE: Make sure to click the link in your browser console to create the composite index in Firebase!
        const q = query(
          collection(db, "products"),
          where("approved", "==", true),
          where("promoted", "==", true),
          limit(6)
        );

        const snapshot = await getDocs(q);

        if (isMounted) {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching featured products: ", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeatured();

    return () => {
      isMounted = false; // Component unmount hone par state update block karega
    };
  }, []);

  // Agar load ho chuka hai aur database mein koi featured product nahi mila, toh section chhupa do
  if (!loading && !products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          ⭐ Featured Products
        </h2>

        <Link
          to="/browse"
          className="text-blue-600 font-medium hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? // Firestore se data aane tak cards ka skeleton loading state
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-gray-100 rounded animate-pulse" />
            ))
          : // Data load hone ke baad actual cards render honge
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleFavorite={() => console.log(`Toggled favorite for: ${product.id}`)}
              />
            ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;