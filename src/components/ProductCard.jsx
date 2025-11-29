import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Utils
import formatPrice from "../utils/formatPrice";
import getImageUrl from "../utils/getImageUrl";
import truncate from "../utils/truncate";

// Icons
import HeartIcon from "../icons/HeartIcon";
import CallIcon from "../icons/CallIcon";
import StarIcon from "../icons/StarIcon";

const ProductCard = ({ product, onToggleFavorite }) => {
  // Destructure for better readability, but the existing code is fine
  const { title, price, description: rawDescription } = product || {};
  const imageSrc = getImageUrl(product);
  const formattedTitle = title || "Untitled Product";
  const formattedPrice = price ? formatPrice(price) : "Price not set";
  // The original code calculated 'description' but didn't use it.
  // We'll use the raw description for the line-clamp-2 paragraph, as intended.
  const description = truncate(rawDescription, 60); // This variable is not used in the final JSX structure, but kept for context.

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition p-3 flex flex-col h-full"
      aria-labelledby={`product-title-${product.id}`}
    >
      {/* Header: badge + favorite btn */}
      <div className="flex items-start justify-between gap-2">
        {product.promoted && (
          <span className="flex items-center gap-1 text-xs bg-yellow-300 px-2 py-1 rounded-full shadow-sm font-medium">
            <StarIcon size={14} />
            Promoted
          </span>
        )}

        <button
          onClick={() => onToggleFavorite(product)} // Assuming onToggleFavorite takes the product
          aria-label="toggle favorite"
          className="p-2 rounded-lg border hover:bg-gray-50 transition"
        >
          <HeartIcon filled={product.isFavorite} size={20} />
        </button>
      </div>

      {/* Main Product Details (Wrapped in Link) */}
      <Link to={`/product/${product.id}`} className="mt-3 flex-1 flex flex-col">
        {/* Image */}
        <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={imageSrc}
            alt={formattedTitle}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Details */}
        <div className="mt-3">
          <h3
            id={`product-title-${product.id}`}
            className="text-sm font-semibold line-clamp-2"
          >
            {formattedTitle}
          </h3>

          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {product?.description}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm font-bold">{formattedPrice}</div>
            <div className="text-xs text-gray-500">{product?.location}</div>
          </div>

          <div className="mt-2 flex gap-2 text-xs">
            <span className="bg-blue-50 px-2 py-1 rounded-full">
              {product?.category}
            </span>
          </div>
        </div>
      </Link>
      {/* End of Link */}

      {/* Call button MUST be outside Link */}
      {product?.sellerPhone && (
        <a
          href={`tel:${product.sellerPhone}`}
          className="mt-2 inline-block w-fit text-xs px-2 py-1 rounded-full border hover:bg-gray-50 transition"
        >
          Call
        </a>
      )}
    </motion.article>
  );
};

export default ProductCard;