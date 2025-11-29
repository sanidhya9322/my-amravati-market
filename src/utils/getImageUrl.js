export default function getImageUrl(product) {
  if (!product) return "/placeholder.png";

  // priority 1 → imageUrls array
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    return product.imageUrls[0];
  }

  // priority 2 → single imageUrl
  if (product.imageUrl) {
    return product.imageUrl;
  }

  // fallback
  return "/placeholder.png";
}
