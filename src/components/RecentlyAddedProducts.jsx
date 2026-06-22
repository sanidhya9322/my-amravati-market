import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import ProductCard from "./ProductCard";

const RecentlyAddedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("approved", "==", true),
          orderBy("createdAt", "desc"),
          limit(6)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-6">
          Recently Added Products
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          🔥 Recently Added Products
        </h2>

        <Link
          to="/browse"
          className="text-blue-600 font-medium hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onToggleFavorite={() => {}}
          />
        ))}
      </div>
    </section>
  );
};

export default RecentlyAddedProducts;