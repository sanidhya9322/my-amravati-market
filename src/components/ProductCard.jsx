import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Utils
import formatPrice from "../utils/formatPrice";
import getImageUrl from "../utils/getImageUrl";

// Icons
import HeartIcon from "../icons/HeartIcon";
import StarIcon from "../icons/StarIcon";

const ProductCard = ({ product, onToggleFavorite }) => {
  if (!product) return null;

  const {
    id,
    title,
    price,
    location,
    promoted,
    isFavorite = false, // 🔴 default false (important)
  } = product;

  const imageSrc = getImageUrl(product);
  const displayTitle = title || "Untitled product";
  const displayPrice =
    price !== undefined && price !== null
      ? formatPrice(price)
      : "Price not set";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
    >
      {/* IMAGE SECTION */}
      <div className="relative">
        {/* PROMOTED BADGE */}
        {promoted && (
          <span className="absolute top-2 left-2 z-10 flex items-center gap-1 text-xs bg-yellow-300 px-2 py-1 rounded-full font-medium shadow-sm">
            <StarIcon size={12} />
            Promoted
          </span>
        )}

        {/* ❤️ FAVORITE BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // 🔥 VERY IMPORTANT
            onToggleFavorite(id); // ✅ ONLY productId
          }}
          aria-label="Toggle wishlist"
          className="absolute top-2 right-2 z-10 p-2 bg-white/90 rounded-full shadow hover:bg-white transition"
        >
          <HeartIcon filled={isFavorite} size={18} />
        </button>

        {/* IMAGE */}
        <Link to={`/product/${id}`}>
          <div className="w-full aspect-[4/3] bg-gray-100">
            <img
              src={imageSrc}
              alt={displayTitle}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>

      {/* CONTENT */}
      <Link to={`/product/${id}`} className="block p-3">
        <div className="text-base font-bold text-green-600">
          {displayPrice}
        </div>

        <div className="text-xs text-gray-500 mt-0.5">
          {location}
        </div>

        <h3 className="mt-1 text-sm font-semibold line-clamp-2">
          {displayTitle}
        </h3>
      </Link>
    </motion.article>
  );
};

export default ProductCard;
