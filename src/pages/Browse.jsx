import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const BrowseProducts = () => {
  const [products, setProducts] = useState([]);
  const [filterLocation, setFilterLocation] = useState('');

  // 🧠 Load all products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // 🧼 Filter products based on selected location
  const filteredProducts = filterLocation
    ? products.filter((product) => product.location === filterLocation)
    : products;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Browse Products</h1>

      {/* 🌍 Location Filter */}
      <div className="mb-4">
        <label className="font-semibold mr-2">Filter by Location:</label>
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="">All</option>
          <option value="Amravati">Amravati</option>
          <option value="Achalpur">Achalpur</option>
          <option value="Chandur Bazar">Chandur Bazar</option>
          <option value="Warud">Warud</option>
          <option value="Daryapur">Daryapur</option>
          <option value="Morshi">Morshi</option>
          <option value="Anjangaon">Anjangaon</option>
          {/* Add more talukas or areas here */}
        </select>
      </div>

      {/* 🛍️ Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded shadow p-4 flex flex-col"
            >
              {/* Image */}
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-48 object-cover mb-2 rounded"
                />
              )}

              {/* Info */}
              <h2 className="text-lg font-bold">{product.title}</h2>
              <p className="text-gray-700 mb-1">{product.description}</p>
              <p className="font-semibold text-sm">
                ₹{product.price} | {product.category}
              </p>
              <p className="text-sm text-gray-600">📍 {product.location}</p>

              {/* 📞 Contact Seller */}
              {product.sellerPhone ? (
                <a
                  href={`https://wa.me/${product.sellerPhone}?text=${encodeURIComponent(
                    `Hi! I'm interested in your product "${product.title}" on MyAmravati Market.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3"
                >
                  <button className="w-full bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded">
                    Contact Seller
                  </button>
                </a>
              ) : (
                <p className="text-red-500 mt-2">No phone number available</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrowseProducts;
