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
    <div className="px-4 sm:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Explore MyAmravati Market</h1>

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
          <option value="Anjangaon Surji">Anjangaon Surji</option>
          <option value="Bhatkuli">Bhatkuli</option>
          <option value="Chandur Bazar">Chandur Bazar</option>
          <option value="Chandur Railway">Chandur Railway</option>
          <option value="Chikhaldara">Chikhaldara</option>
          <option value="Warud">Warud</option>
          <option value="Dhamangaon Railway">Dhamangaon Railway</option>
          <option value="Dharni">Dharni</option>
          <option value="Daryapur">Daryapur</option>
          <option value="Morshi">Morshi</option>
          <option value="Nandgaon Khandeshwar">Nandgaon Khandeshwar</option>
          <option value="Teosa">Teosa</option>
          <option value="Anjangaon">Anjangaon</option>
          {/* Add more talukas or areas here */}
        </select>
      </div>

      {/* 🛍️ Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 flex flex-col"
            >
              {/* Image */}
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
              )}

              {/* Info */}
              <h2 className="text-xl font-semibold mb-1">{product.title}</h2>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-lg font-bold text-green-600 mb-1">₹{product.price}</p>
              <p className="text-sm text-gray-500 mb-2">
                ₹{product.price} | {product.category}
              </p>
              <p className="text-sm text-gray-600">📌 {product.location}</p>

              {/* 📞 Contact Seller */}
              {product.sellerPhone ? (
                <a
                  href={`https://wa.me/${product.sellerPhone}?text=${encodeURIComponent(
                    `Hi! I'm interested in your product "${product.title}" on MyAmravati Market.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
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
