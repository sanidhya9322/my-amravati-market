import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase/firebaseConfig';
import { motion } from 'framer-motion';
import { serverTimestamp } from 'firebase/firestore';

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
   const q = query(collection(db, `users/${user.uid}/favorites`));
    console.log("Current user:", user?.uid);
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
  title: product.title || '',
  imageUrl: product.imageUrl || '',
  price: product.price || 0,
  createdAt: product.createdAt || serverTimestamp(),
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
      className="px-4 pb-24 pt-4 bg-gray-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">🛒 Explore MyAmravati Market</h1>

      <div className="mb-4 space-y-3">
        <div>
          <label className="font-semibold block mb-1 text-sm">Search Products:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title..."
            className="border px-3 py-2 rounded w-full text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold block mb-1 text-sm">Filter by Location:</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="border px-3 py-2 rounded w-full text-sm"
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
            <label className="font-semibold block mb-1 text-sm">Filter by Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border px-3 py-2 rounded w-full text-sm"
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <p className="text-center col-span-full text-sm">No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow p-3 flex flex-col"
              whileHover={{ scale: 1.02 }}
            >
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-36 object-cover rounded-xl mb-2"
                />
              )}
              <h2 className="text-sm font-semibold mb-1 line-clamp-2">{product.title}</h2>
              <p className="text-xs text-gray-600 mb-1 line-clamp-2">{product.description}</p>
              <p className="text-sm font-bold text-green-600 mb-1">₹{product.price}</p>
              <p className="text-xs text-gray-500">📦 {product.category}</p>
              <p className="text-xs text-gray-500 mb-2">📌 {product.location}</p>

              {product.sellerPhone ? (
                <a
                  href={`https://wa.me/${product.sellerPhone}?text=${encodeURIComponent(
                    `Hi! I'm interested in your product "${product.title}" on MyAmravati Market.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto"
                >
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-black text-xs px-3 py-2 rounded mb-2">
                    Contact Seller
                  </button>
                </a>
              ) : (
                <p className="text-red-500 text-xs">No phone number available</p>
              )}

              <button
                className="w-full border border-red-500 text-red-500 hover:bg-red-100 text-xs px-3 py-2 rounded"
                onClick={() => handleAddToFavorites(product)}
              >
                ❤️ Add to Favorites
              </button>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Browse;
