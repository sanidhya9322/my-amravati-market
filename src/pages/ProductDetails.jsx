import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { FaWhatsapp, FaTelegramPlane, FaCopy, FaMapMarkerAlt, FaShareAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);  const [shareOpen, setShareOpen] = useState(false);
  const [mainImage, setMainImage] = useState(null);

  // 🔹 Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, 'products', id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const data = { id: productSnap.id, ...productSnap.data() };          setProduct(data);
          if (data.imageUrls?.length > 0) {
            setMainImage(data.imageUrls[0]);
          } else if (data.imageUrl) {
            setMainImage(data.imageUrl);
          }
        } else {
          toast.error('Product not found');
          navigate('/browse');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        toast.error('Something went wrong');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // 🔹 Fetch similar products
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

  // 🔹 Copy product link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('🔗 Link copied to clipboard!');
    setShareOpen(false);
  };

  // 🔹 Contact Seller (Login Required)
  const handleContactSeller = () => {
    const user = auth.currentUser;

    if (!user) {
      toast.error('⚠️ Please login or signup to contact the seller');
      navigate('/login');
      return;
    }

    const phone = product.contact || product.sellerPhone;
    if (!phone) {
      toast.error('❌ Seller contact not available');
      return;
    }

    const message = `Hi! I'm interested in your product "${product.title}" on MyAmravati Market.`;
    const whatsappLink = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  if (loading || !product) {
    return <div className="p-4 text-center">⏳ Loading product...</div>;
  }

  return (
    <motion.div
      className="px-4 py-6 min-h-screen bg-gray-50 max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 text-sm hover:underline"
      >
        ← Back to Browse
      </button>

      {/* 🏷 Product Card */}
      <div className="bg-white rounded-2xl shadow p-5 relative grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🖼 Image Gallery */}
        <div>
          {mainImage && (
            <img
              src={mainImage}
              alt={product.title}
              className="w-full aspect-square object-contain rounded-xl bg-gray-100"
            />
          )}

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto sm:grid sm:grid-cols-5 mb-4">
            {(product.imageUrls?.length > 0 ? product.imageUrls : [product.imageUrl])
              .filter(Boolean)
              .map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border transition ${
                    mainImage === img ? 'border-blue-500 shadow' : 'border-gray-300'
                  }`}
                />
              ))}
          </div>
        </div>

        {/* 🧾 Product Info */}
        <div>
          {/* Share Button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="bg-white border shadow p-2 rounded-full hover:bg-gray-100"
            >
              <FaShareAlt size={18} />
            </button>

            {shareOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md z-10">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Check out this product: ${window.location.origin}/product/${id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <FaWhatsapp className="text-green-600 mr-2" /> WhatsApp
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(
                    `${window.location.origin}/product/${id}`
                  )}&text=${encodeURIComponent('Check out this product!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <FaTelegramPlane className="text-blue-500 mr-2" /> Telegram
                </a>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                >
                  <FaCopy className="text-gray-700 mr-2" /> Copy Link
                </button>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-3">{product.title}</h1>
          <p className="text-gray-700 mb-3">{product.description}</p>
          <div className="text-2xl text-green-600 font-bold mb-4">₹{product.price}</div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-yellow-100 rounded-full">
              🏷 {product.category}
            </span>
            <span className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-pink-100 rounded-full">
              <FaMapMarkerAlt className="text-pink-600" /> {product.location}
            </span>
          </div>

          {/* 💬 Contact Seller */}
          {product.contact || product.sellerPhone ? (
            <div className="fixed bottom-0 left-0 w-full bg-white p-3 border-t md:static md:border-none md:p-0">
              <button
                onClick={handleContactSeller}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg shadow md:py-2"
              >
                💬 Contact Seller via WhatsApp
              </button>
            </div>
          ) : (
            <p className="text-red-500 text-sm">No seller contact info available.</p>
          )}
        </div>
      </div>

      {/* 🧭 Similar Products */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4">🧭 Similar Products</h3>
        {similarLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-2xl shadow h-48"></div>
            ))}
          </div>
        ) : similarProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {similarProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow p-3 flex flex-col h-full"
              >
                <Link
                  to={`/product/${p.id}`}
                  className="block bg-white rounded-2xl shadow p-3 hover:shadow-md transition"
                >
                  <img
                    src={p.imageUrls?.[0] || p.imageUrl || '/placeholder.png'}
                    alt={p.title}
                    className="w-full h-32 sm:h-36 object-cover rounded-xl mb-2"
                  />
                  <div className="flex flex-col flex-grow"></div>
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
