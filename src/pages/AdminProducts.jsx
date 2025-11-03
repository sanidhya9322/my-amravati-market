import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🛍️ All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.title}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
            )}
            <h2 className="font-semibold text-lg">{p.title}</h2>
            <p className="text-gray-600">{p.category}</p>
            <p className="text-green-600 font-semibold">₹{p.price}</p>
            <button
              onClick={() => handleDelete(p.id)}
              className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
