import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import {collection, getDocs, query, orderBy, doc, setDoc, deleteDoc, getDoc,} from 'firebase/firestore';
import { motion } from 'framer-motion';
import { serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Browse = () => {
  const [products, setProducts] = useState([]);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

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
          title: product.title || '',
          imageUrl: product.imageUrl || '',
          price: product.price || 0,
          description: product.description || '',
          category: product.category || '',
          location: product.location || '',
          sellerPhone: product.sellerPhone || '',
          createdAt: product.createdAt || serverTimestamp(),
        });
        alert('Added to favorites!');
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      const locationMatch = filterLocation ? product.location === filterLocation : true;
      const categoryMatch = filterCategory ? product.category === filterCategory : true;
      const matchesTitle = product.title.toLowerCase().includes(searchTerm.toLowerCase());
      return locationMatch && categoryMatch && matchesTitle;
    })
    .sort((a, b) => {
      if (sortOrder === 'priceLowHigh') return a.price - b.price;
      if (sortOrder === 'priceHighLow') return b.price - a.price;
      if (sortOrder === 'newest') return b.createdAt?.seconds - a.createdAt?.seconds;
      return 0;
    });

  return (
    <motion.div
      className="px-4 pb-24 pt-4 bg-gray-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">🛒 Explore MyAmravati Market</h1>

      {/* Filters */}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-semibold block mb-1 text-sm">Filter by Location:</label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="border px-3 py-2 rounded w-full text-sm"
            >
              <option value="">All</option>
              {["Amravati", "Achalpur", "Anjangaon Surji", "Bhatkuli", "Chandur Bazar", "Chandur Railway", "Chikhaldara", "Warud", "Dhamangaon Railway", "Dharni", "Daryapur", "Morshi", "Nandgaon Khandeshwar", "Teosa", "Anjangaon"].map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
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
              {["Books & Notes", "Handmade Items", "Homemade Food", "Second-hand Items", "New Items, Electronics"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-sm">Sort By:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border px-3 py-2 rounded w-full text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <p className="text-center col-span-full text-sm">No products found.</p>
        ) : (
          filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow p-3 flex flex-col"
            >
              <Link to={`/product/${product.id}`} className="flex flex-col flex-grow">
                <img
                  src={product.imageUrl || '/placeholder.png'}
                  alt={product.title}
                  className="w-full h-36 object-cover rounded-xl mb-2"
                  loading="lazy"
                />
                <h2 className="text-sm font-semibold mb-1 line-clamp-2">{product.title}</h2>
                <p className="text-xs text-gray-600 mb-1 line-clamp-2">{product.description}</p>
                <p className="text-sm font-bold text-green-600 mb-1">₹{product.price}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="bg-blue-100 px-2 py-1 rounded-full">{product.category}</span>
                  <span className="bg-yellow-100 px-2 py-1 rounded-full">{product.location}</span>
                </div>
              </Link>

              <button
                className="w-full border border-red-500 text-red-500 hover:bg-red-100 text-xs px-3 py-2 rounded mt-2"
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
