import React, { useState, useEffect } from "react";
import { storage, db, auth } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Books & Notes",
    location: "",
    sellerPhone: "",
  });

  const [images, setImages] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const DAILY_LIMIT = 3;

  // ✅ Auto-detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const place =
              data.address?.village ||
              data.address?.city ||
              data.address?.town ||
              "";
            if (place) {
              setFormData((prev) => ({ ...prev, location: place }));
            }
          } catch (error) {
            console.warn("Location fetch failed:", error);
          }
        },
        () => console.warn("Geolocation permission denied.")
      );
    }
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Handle image selection + preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      toast.error("⚠️ You can upload up to 6 images only.");
      return;
    }
    setImages(files);
    setPreviewURLs(files.map((file) => URL.createObjectURL(file)));
  };

  // ✅ Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price) {
      toast.error("⚠️ Please fill all required fields.");
      return;
    }

    if (images.length === 0) {
      toast.error("⚠️ Please select at least one image.");
      return;
    }

    if (!auth.currentUser) {
      toast.error("🚫 You must be logged in to add a product.");
      return;
    }

    setUploading(true);

    try {
      // ✅ Daily post limit check
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where("userId", "==", auth.currentUser.uid),
        where("createdAt", ">=", today)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.size >= DAILY_LIMIT) {
        toast.error("🚫 Daily post limit reached (3 per day).");
        setUploading(false);
        return;
      }

      // ✅ Upload all images
      const imageUrls = [];
      for (const image of images) {
        const imageRef = ref(
          storage,
          `productImages/${Date.now()}_${image.name}`
        );
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);
        imageUrls.push(imageUrl);
      }

      // ✅ Save product in Firestore
      await addDoc(productsRef, {
        ...formData,
        price: parseFloat(formData.price),
        imageUrls,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
        featured: false,
        featuredExpires: null,
      });

      toast.success("✅ Product added successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10 px-4 bg-gray-100 min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          📦 Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Product Name"
            required
            className="w-full px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Description */}
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Feature Description"
            required
            rows="4"
            className="w-full px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>

          {/* Price + Location */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price (₹)"
              required
              className="flex-1 px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Your Village / Local Area"
              required
              className="flex-1 px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category + Phone */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="flex-1 px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Books & Notes">📚 Books & Notes</option>
              <option value="Handmade Items">🧵 Handmade Items</option>
              <option value="Homemade Food">🍱 Homemade Food</option>
              <option value="Second-hand Items">♻️ Second-hand Items</option>
              <option value="New Items">🆕 New Items</option>
            </select>

            <input
              type="tel"
              name="sellerPhone"
              value={formData.sellerPhone}
              onChange={handleChange}
              placeholder="WhatsApp Number"
              required
              pattern="[0-9]{10}"
              className="flex-1 px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Upload Product Images (Max 6)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              required
              className="w-full px-4 py-2 border rounded-xl shadow-sm text-sm sm:text-base"
            />

            {previewURLs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {previewURLs.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${idx}`}
                      className="rounded-xl w-full h-32 object-cover border shadow"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 rounded-xl font-semibold text-white text-base sm:text-lg shadow-md transition ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {uploading ? "⏳ Uploading..." : "🚀 Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
