import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const favRef = collection(db, 'users', user.uid, 'favorites');
      const snapshot = await getDocs(favRef);
      const favList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFavorites(favList);
    };

    fetchFavorites();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Favorite Products ❤️</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow-md">
            <img src={product.imageUrl} alt={product.title} className="h-40 w-full object-cover rounded" />
            <h3 className="text-lg font-semibold mt-2">{product.title}</h3>
            <p className="text-green-700 font-bold">₹{product.price}</p>
            <p className="text-sm text-gray-500">{product.location} | {product.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
