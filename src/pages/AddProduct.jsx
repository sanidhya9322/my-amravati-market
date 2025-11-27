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

// ==========================================================
// ✅ Your Replaced/Updated Image Upload Function
// ==========================================================
const uploadImages = async (files, userId) => {
  const uploadedUrls = [];

  for (const file of files) {
    const fileName = `${Date.now()}_${file.name}`;
    // Good: Using userId in the path for better organization and security rules
    const storageRef = ref(storage, `productImages/${userId}/${fileName}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      uploadedUrls.push(downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
      // Fail fast or continue? Here we throw to stop the product creation
      throw new Error(`Failed to upload image ${file.name}`);
    }
  }

  return uploadedUrls;
};
// ==========================================================

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

  // ✅ Auto-detect user location (kept as is)
  useEffect(() => {
    // ... (Geolocation logic remains the same)
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

  // ✅ Handle input changes (kept as is)
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Handle image selection + preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Cleanup previous previews to prevent memory leak
    previewURLs.forEach(URL.revokeObjectURL); 

    if (files.length > 6) {
      toast.error("⚠️ You can upload up to 6 images only.");
      setImages([]);
      setPreviewURLs([]);
      return;
    }
    
    setImages(files);
    setPreviewURLs(files.map((file) => URL.createObjectURL(file)));
  };

  // ✅ Remove image from selection
  const handleRemoveImage = (indexToRemove) => {
    // Revoke the URL for the image being removed
    URL.revokeObjectURL(previewURLs[indexToRemove]);

    setImages(images.filter((_, index) => index !== indexToRemove));
    setPreviewURLs(previewURLs.filter((_, index) => index !== indexToRemove));
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
      // ✅ Daily post limit check (kept as is)
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

      // 🔄 Use the new uploadImages function
      const imageUrls = await uploadImages(images, auth.currentUser.uid);
      
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
      // Cleanup previews on success
      previewURLs.forEach(URL.revokeObjectURL);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      console.error("Error adding product:", error);
      // Improve error message for the user
      toast.error(`❌ Failed to add product: ${error.message.includes("upload") ? "Image upload failed." : "Please check your network."}`);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Component JSX (kept the same structure)
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
              <option value="From Shop">🛒 From shop</option>
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
              // Set required to false here since we handle the check manually
              required={images.length === 0} 
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
                    {/* ✅ Add a delete button to the image preview */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 transition duration-300"
                      aria-label="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
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