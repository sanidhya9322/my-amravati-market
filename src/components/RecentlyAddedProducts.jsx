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

// Empty function to prevent unnecessary re-renders
const noop = () => {};

const RecentlyAddedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("approved", "==", true),
          orderBy("createdAt", "desc"),
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
        console.error("Error fetching recent products: ", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && !products.length) return null;

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
        {loading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 animate-pulse rounded-xl"
              />
            ))
          : products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleFavorite={noop}
              />
            ))}
      </div>
    </section>
  );
};

export default RecentlyAddedProducts;