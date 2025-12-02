import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'; // Added 'where'
import { FaWhatsapp, FaTelegramPlane, FaCopy, FaMapMarkerAlt, FaShareAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

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

    // 🔹 Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productRef = doc(db, 'products', id);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const data = { id: productSnap.id, ...productSnap.data() };
                    setProduct(data);
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

    // 🔹 Fetch similar products (Corrected for performance: server-side filtering)
    useEffect(() => {
        const fetchSimilar = async () => {
            if (!product?.category) return;
            setSimilarLoading(true);

            try {
                const productsRef = collection(db, 'products');

                // Query for products in the same category
                const q = query(
                    productsRef,
                    where('category', '==', product.category)
                );
                
                const snapshot = await getDocs(q);

                const similar = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    // Client-side filter to exclude the current product
                    .filter(p => p.id !== id) 
                    .slice(0, 6); // Limit to 6 results

                setSimilarProducts(similar);
            } catch (err) {
                console.error('Error fetching similar products:', err);
            } finally {
                setSimilarLoading(false);
            }
        };

        if (product) fetchSimilar();
    }, [product, id]);

    // 🔹 Copy Link
    const handleCopyLink = () => {
        const url = `${window.location.origin}/product/${id}`;
        navigator.clipboard.writeText(url);
        toast.success('🔗 Link Copied!');
        setShareOpen(false);
    };

    // 🔹 Contact Seller
    const handleContactSeller = () => {
        const user = auth.currentUser;

        if (!user) {
            toast.error('⚠️ Please login first');
            navigate('/login');
            return;
        }

        const phone = product.contact || product.sellerPhone;
        if (!phone) {
            toast.error('❌ Seller contact not available');
            return;
        }

        const message = `Hi! I'm interested in "${product.title}" on MyAmravati Market.`;
        window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (loading || !product) {
        return <div className="p-4 text-center">⏳ Loading product...</div>;
    }

    // Determine the array of images to use for the Swiper components
    const images = product.imageUrls?.length > 0 ? product.imageUrls : [product.imageUrl];

    return (
        <motion.div
            className="px-4 py-6 min-h-screen bg-gray-50 max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-blue-600 text-sm hover:underline"
            >
                ← Back to Browse
            </button>

            {/* Product Card */}
            <div className="bg-white rounded-2xl shadow p-5 relative grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ⭐ Swiper Image Slider */}
                <div>
                    <Swiper
                        modules={[Navigation, Pagination, Thumbs]}
                        navigation
                        pagination={{ clickable: true }}
                        thumbs={{ swiper: activeThumbs }}
                        className="rounded-xl overflow-hidden"
                    >
                        {images.map((img, idx) => (
                            <SwiperSlide key={idx}>
                                <img
                                    src={img}
                                    alt={`img-${idx}`}
                                    className="w-full h-[350px] object-contain bg-gray-100"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Thumbnails */}
                    <Swiper
                        modules={[Thumbs]}
                        watchSlidesProgress
                        onSwiper={setActiveThumbs}
                        slidesPerView={4}
                        spaceBetween={10}
                        className="mt-3"
                    >
                        {images.map((img, idx) => (
                            <SwiperSlide key={idx}>
                                <img
                                    src={img}
                                    className="w-full h-20 object-cover rounded-xl cursor-pointer border"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Product Details */}
                <div className="relative">

                    {/* Share */}
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
                                        `${window.location.origin}/product/${id}`
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
                                    )}&text=Check this out`}
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

                    <h1 className="text-2xl font-bold">{product.title}</h1>

                    {/* ⭐ Description with Read More */}
                    <div
                        className={`text-gray-700 mt-2 transition-all duration-300 ${
                            expanded ? "max-h-full" : "max-h-24 overflow-hidden"
                        }`}
                    >
                        {product.description}
                    </div>

                    {product.description?.length > 120 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-blue-600 mt-1 text-sm"
                        >
                            {expanded ? "Read Less ▲" : "Read More ▼"}
                        </button>
                    )}

                    <div className="text-2xl text-green-600 font-bold mt-4">₹{product.price}</div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-yellow-100 rounded-full">
                            🏷 {product.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-pink-100 rounded-full">
                            <FaMapMarkerAlt className="text-pink-600" /> {product.location}
                        </span>
                    </div>

                    {/* Contact Seller */}
                    {product.contact || product.sellerPhone ? (
                        <div className="fixed bottom-0 left-0 w-full bg-white p-3 border-t md:static md:p-0">
                            <button
                                onClick={handleContactSeller}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg shadow"
                            >
                                💬 Contact Seller on WhatsApp
                            </button>
                        </div>
                    ) : (
                        <p className="text-red-500 mt-2 text-sm">No seller contact info.</p>
                    )}
                </div>
            </div>

            {/* Similar Products */}
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
                                className="bg-white rounded-2xl shadow p-3"
                            >
                                <Link
                                    to={`/product/${p.id}`}
                                    className="block hover:shadow-md transition rounded-xl"
                                >
                                    <img
                                        src={p.imageUrls?.[0] || p.imageUrl}
                                        className="w-full h-36 object-cover rounded-xl"
                                        alt={p.title}
                                    />
                                    <h4 className="text-sm font-semibold mt-2 line-clamp-2">{p.title}</h4>
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