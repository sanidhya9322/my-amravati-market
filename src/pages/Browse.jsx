import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';
import { auth } from '../firebase/firebaseConfig';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const Browse = () => {
  const [products, setProducts] = useState([]);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
 
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

  const handleAddToFavorites = async (product) => {
    const user = auth.currentUser;
    if (!user) return alert('Please login to save favorites');

    const favRef = doc(db, 'users', user.uid, 'favorites', product.id);
    try {
      const favSnap = await getDoc(favRef);

      if (favSnap.exists()) {
        await deleteDoc(favRef);
        alert('Removed from favorites!');
      } else {
        await setDoc(favRef, {
          productId: product.id,
          title: product.title,
          imageUrl: product.imageUrl,
          price: product.price,
          createdAt: product.createdAt,
        });
        alert('Added to favorites!');
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };
 
  const filteredProducts = products.filter((product) => {
    const locationMatch = filterLocation ? product.location === filterLocation : true;
    const categoryMatch = filterCategory ? product.category === filterCategory : true;
    const matchesTitle = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    return locationMatch && categoryMatch && matchesTitle;
  });

  return (
    <motion.div
      className="px-4 sm:px-8 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">🛒 Explore MyAmravati Market</h1>

      <div className="mb-4">
        <label className="font-semibold block mb-1">Search Products:</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title..."
          className="border px-3 py-1 rounded w-full sm:w-64"
        />
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-semibold block mb-1">Filter by Location:</label>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="border px-3 py-1 rounded w-full"
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
          </select>
        </div>

       <div>
          <label className="font-semibold block mb-1">Filter by Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border px-3 py-1 rounded w-full"
          >
            <option value="">All</option>
            <option>Books & Notes</option>
            <option>Handmade Items</option>
            <option>Homemade Food</option>
            <option>Second-hand Items</option>
            <option>New Items</option>
          </select>
        </div>
      </div>
 
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-2">
        {filteredProducts.length === 0 ? (
          <p className="text-center col-span-full">No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <motion.div
              key={product.id}
               initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow p-4 flex flex-col justify-between"
              whileHover={{ scale: 1.02 }}
            >

              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-40 object-cover rounded-xl"
                />
             )}
              <h2 className="text-xl font-semibold mb-1">{product.title}</h2>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-lg font-bold text-green-600 mb-1">₹{product.price}</p>
              <p className="text-sm text-gray-500 mb-1">Category: {product.category}</p>
              <p className="text-sm text-gray-500 mb-3">📌 {product.location}</p>
 
              {product.sellerPhone ? (
                <a
                  href={`https://wa.me/${product.sellerPhone}?text=${encodeURIComponent(
                    `Hi! I'm interested in your product "${product.title}" on MyAmravati Market.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-block"
                >
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-black text-sm px-4 py-2 rounded mb-2">
                    Contact Seller
                  </button>
                </a>
              ) : (
                <p className="text-red-500 text-sm">No phone number available</p>
              )}
              <button
                className="w-full border border-red-500 text-red-500 hover:bg-red-100 text-sm px-4 py-2 rounded"
                onClick={() => handleAddToFavorites(product)}
              >
                ❤️Add to Favorites
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Browse;
