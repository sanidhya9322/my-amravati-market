import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { FaWhatsapp, FaTelegramPlane, FaCopy, FaMapMarkerAlt, FaShareAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// 🔹 CHAT SERVICE
import { getOrCreateConversation } from '../utils/chatService';

// ⭐ Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);

  const [shareOpen, setShareOpen] = useState(false);
  const [activeThumbs, setActiveThumbs] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // 🔹 Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = doc(db, 'products', id);
        const snap = await getDoc(productRef);

        if (!snap.exists()) {
          toast.error('Product not found');
          navigate('/browse');
          return;
        }

        setProduct({ id: snap.id, ...snap.data() });
      } catch (e) {
        toast.error('Something went wrong');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // 🔹 Similar products
  useEffect(() => {
    if (!product?.category) return;

    const fetchSimilar = async () => {
      setSimilarLoading(true);
      try {
        const q = query(
          collection(db, 'products'),
          where('category', '==', product.category)
        );
        const snap = await getDocs(q);
        setSimilarProducts(
          snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.id !== id)
            .slice(0, 6)
        );
      } catch {}
      finally {
        setSimilarLoading(false);
      }
    };
    fetchSimilar();
  }, [product, id]);

  // 🔹 COPY LINK
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/product/${id}`);
    toast.success('Link copied');
    setShareOpen(false);
  };

  // 🔹 CHAT WITH SELLER (NEW)
  const handleChatWithSeller = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to chat');
      navigate('/login');
      return;
    }

    try {
      const conversationId = await getOrCreateConversation({
        productId: product.id,
        productTitle: product.title,
        productImage: product.imageUrls?.[0] || product.imageUrl || '',
        buyer: {
          uid: auth.currentUser.uid,
          name: auth.currentUser.displayName || 'Buyer',
        },
        seller: {
          uid: product.userId,
          name: product.sellerName || 'Seller',
        },
      });

      navigate(`/messages/${conversationId}`);
    } catch (err) {
      console.error(err);
      toast.error('Unable to start chat');
    }
  };

  if (loading || !product) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  const images = product.imageUrls?.length ? product.imageUrls : [product.imageUrl];

  return (
    <motion.div className="px-4 py-6 min-h-screen bg-gray-50 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 text-sm">← Back</button>

      <div className="bg-white rounded-2xl shadow p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Images */}
        <div>
          <Swiper modules={[Navigation, Pagination, Thumbs]} navigation pagination thumbs={{ swiper: activeThumbs }}>
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img} alt="" className="w-full h-[350px] object-contain bg-gray-100" />
              </SwiperSlide>
            ))}
          </Swiper>

          <Swiper modules={[Thumbs]} onSwiper={setActiveThumbs} slidesPerView={4} spaceBetween={10} className="mt-3">
            {images.map((img, i) => (
              <SwiperSlide key={i}>
                <img src={img} className="w-full h-20 object-cover rounded-lg border" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Details */}
        <div className="relative">
          <div className="absolute top-4 right-4">
            <button onClick={() => setShareOpen(!shareOpen)} className="border p-2 rounded-full">
              <FaShareAlt />
            </button>
            {shareOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow">
                <button onClick={handleCopyLink} className="px-4 py-2 text-sm flex items-center">
                  <FaCopy className="mr-2" /> Copy link
                </button>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold">{product.title}</h1>

          <div className={`text-gray-700 mt-2 ${expanded ? '' : 'max-h-24 overflow-hidden'}`}>
            {product.description}
          </div>
          {product.description?.length > 120 && (
            <button onClick={() => setExpanded(!expanded)} className="text-blue-600 text-sm">
              {expanded ? 'Read less' : 'Read more'}
            </button>
          )}

          <div className="text-2xl text-green-600 font-bold mt-4">₹{product.price}</div>

          <div className="flex gap-2 mt-3">
            <span className="px-3 py-1 bg-yellow-100 rounded-full text-sm">{product.category}</span>
            <span className="px-3 py-1 bg-pink-100 rounded-full text-sm flex items-center">
              <FaMapMarkerAlt className="mr-1" /> {product.location}
            </span>
          </div>

          {/* 🔥 CHAT BUTTON */}
          <button
            onClick={handleChatWithSeller}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold">
        
           💬 Chat with Seller (No phone number shared)
          </button>

          {/* WhatsApp (secondary) */}
          {(product.contact || product.sellerPhone) && (
            <button
              onClick={() => window.open(`https://wa.me/91${product.sellerPhone}`, '_blank')}
              className="w-full border border-gray-300 text-gray-600 py-2 rounded-xl text-sm mt-2">
              Contact on WhatsApp
            </button>
            
          )}
          {/* Similar Products */}
<div className="mt-12">
  <h3 className="text-lg font-semibold mb-4">🧭 Similar Products</h3>

  {similarLoading ? (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white p-4 rounded-2xl shadow h-48"
        />
      ))}
    </div>
  ) : similarProducts.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {similarProducts.map(p => (
        <motion.div
          key={p.id}
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow p-3"
        >
          <Link to={`/product/${p.id}`}>
            <img
              src={p.imageUrls?.[0] || p.imageUrl}
              className="w-full h-36 object-cover rounded-xl"
              alt={p.title}
            />
            <h4 className="text-sm font-semibold mt-2 line-clamp-2">
              {p.title}
            </h4>
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
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
