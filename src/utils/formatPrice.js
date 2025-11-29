export default function formatPrice(price) {
  if (!price || isNaN(price)) return "Price not set";
  return `₹${Number(price).toLocaleString("en-IN")}`;
}
