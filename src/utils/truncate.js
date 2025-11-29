export default function truncate(text, limit = 80) {
  if (!text) return "";
  return text.length > limit ? text.substring(0, limit) + "..." : text;
}
