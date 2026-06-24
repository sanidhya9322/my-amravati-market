export default function getImageUrl(product) {
  if (!product) return "/placeholder.png";

  // 🚀 Thumbnail first
  if (
    Array.isArray(product.thumbnailUrls) &&
    product.thumbnailUrls.length > 0
  ) {
    return product.thumbnailUrls[0];
  }

  // Fallback old products
  if (
    Array.isArray(product.imageUrls) &&
    product.imageUrls.length > 0
  ) {
    return product.imageUrls[0];
  }

  if (product.imageUrl) {
    return product.imageUrl;
  }

  return "/placeholder.png";
}