// src/pages/ProductDetails.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Loader2, Share2 } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentURL = window.location.href;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          console.log('No such product!');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-10 h-10 text-gray-600" />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-xl">❌ Product not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-80 object-cover rounded-lg mb-6"
        />
        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
        <p className="text-gray-600 mb-2">📍 {product.location}</p>
        <p className="text-xl text-green-600 font-semibold mb-4">₹{product.price}</p>
        <p className="text-gray-700 mb-4">{product.description}</p>
        <p className="text-sm text-gray-500">📦 Category: {product.category}</p>
        <p className="text-sm text-gray-500">📞 Contact: {product.sellerPhone}</p>

        {/* Share Buttons */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Share2 className="w-5 h-5" /> Share this product
          </h3>
          <div className="flex gap-3">
            <a
              href={`https://wa.me/?text=Check out this product: ${currentURL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${currentURL}&text=Check out this product`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Telegram
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentURL);
                alert('🔗 Link copied to clipboard!');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
