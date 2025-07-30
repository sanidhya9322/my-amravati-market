// ProductDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaTelegramPlane, FaLink } from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          setProduct({ id: productSnap.id, ...productSnap.data() });
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Something went wrong.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!product?.category) return;
      setSimilarLoading(true);
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef);
        const snapshot = await getDocs(q);
        const similar = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== id && p.category === product.category)
          .slice(0, 6);
        setSimilarProducts(similar);
      } catch (err) {
        console.error('Error fetching similar products:', err);
      } finally {
        setSimilarLoading(false);
      }
    };

    if (product) fetchSimilar();
  }, [product, id]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(url);
    alert('🔗 Link copied to clipboard!');
  };

  if (loading) {
    return <div className="p-4 text-center">⏳ Loading product...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">❌ {error}</div>;
  }

  return (
    <motion.div
      className="px-4 py-6 min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 text-sm underline"
      >
        ← Back to Browse
      </button>

      <div className="bg-white rounded-2xl shadow p-5">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-64 object-cover rounded-xl mb-4"
          />
        )}

        <h1 className="text-xl font-semibold mb-2">{product.title}</h1>
        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
        <p className="text-lg text-green-600 font-bold mb-2">₹{product.price}</p>
        <p className="text-sm text-gray-500 mb-1">📦 {product.category}</p>
        <p className="text-sm text-gray-500 mb-4">📌 {product.location}</p>

        {/* Share */}
        <div className="flex gap-4 mb-4">
          <a
            href={`https://wa.me/?text=Check out this product: ${window.location.origin}/product/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 text-xl"
          >
            <FaWhatsapp />
          </a>
          <a
            href={`https://t.me/share/url?url=${window.location.origin}/product/${id}&text=Check out this product!`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 text-xl"
          >
            <FaTelegramPlane />
          </a>
          <button
            onClick={handleCopyLink}
            className="text-gray-600 hover:text-black text-xl"
          >
            <FaLink />
          </button>
        </div>

        {/* Contact Seller */}
        {product.sellerPhone ? (
          <a
            href={`https://wa.me/${product.sellerPhone}?text=${encodeURIComponent(
              `Hi! I'm interested in your product "${product.title}" on MyAmravati Market.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Contact Seller via WhatsApp
            </button>
          </a>
        ) : (
          <p className="text-red-500 text-sm">No seller contact info available.</p>
        )}
      </div>

      {/* Similar Products */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">🧭 Similar Products</h3>
        {similarLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-2xl shadow h-48"></div>
            ))}
          </div>
        ) : similarProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {similarProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow p-3"
              >
                <Link to={`/product/${p.id}`} className="block">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full h-36 object-cover rounded-xl mb-2"
                    />
                  )}
                  <h4 className="text-sm font-semibold line-clamp-2">{p.title}</h4>
                  <p className="text-sm text-green-600 font-bold">₹{p.price}</p>
                  <p className="text-xs text-gray-500">📌 {p.location}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No similar products found.</p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductDetails;
