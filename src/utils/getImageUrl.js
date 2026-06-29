export default function getImageUrl(product) {
  if (!product) return "/placeholder.png";

  // 🚀 1. Thumbnail First (Fastest load time)
  if (product.thumbnailUrl) {
    return product.thumbnailUrl;
  }

  // 🖼️ 2. Fallback: First image in the new array structure
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    return product.imageUrls[0];
  }

  // 🕰️ 3. Fallback: Legacy single image string
  if (product.imageUrl) {
    return product.imageUrl;
  }

  // ❌ 4. Absolute Fallback: Default placeholder
  return "/placeholder.png";
}