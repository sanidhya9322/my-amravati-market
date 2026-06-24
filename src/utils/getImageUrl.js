export default function getImageUrl(product) {
  if (!product) return "/placeholder.png";

  // NEW SYSTEM
  if (
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    return (
      product.images[0].thumbnail ||
      product.images[0].original
    );
  }

  // OLD SYSTEM
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