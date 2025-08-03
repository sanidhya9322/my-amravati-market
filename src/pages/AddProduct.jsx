import React, { useState, useEffect } from "react";
import { storage, db, auth } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
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

  const [image, setImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // 🚦 Daily product post limit (e.g., 3)
  const DAILY_LIMIT = 3;

  useEffect(() => {
    // Auto-fill location using GPS (if allowed)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const cityOrVillage = data.address.village || data.address.city || data.address.town || "";
            setFormData((prev) => ({ ...prev, location: cityOrVillage }));
          } catch (error) {
            console.warn("Location fetch failed:", error);
          }
        },
        (error) => {
          console.warn("Geolocation permission denied.");
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreviewURL(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select an image.");
      return;
    }

    if (!auth.currentUser) {
      toast.error("You must be logged in to add a product.");
      return;
    }

    setUploading(true);

    try {
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

      const imageRef = ref(storage, `productImages/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(productsRef, {
        ...formData,
        price: parseFloat(formData.price),
        imageUrl,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });

      toast.success("✅ Product added successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10 px-4 bg-gray-100 min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          📦 Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Product Name"
            required
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Feature Description"
            required
            rows="4"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price (₹)"
              required
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Your Village / Local Area"
              required
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>📚 Books & Notes</option>
              <option>🧵 Handmade Items</option>
              <option>🍱 Homemade Food</option>
              <option>♻️ Second-hand Items</option>
              <option>🆕 New Items</option>     
              <option>🤖Electronics</option>                        
            </select>

            <input
              type="tel"
              name="sellerPhone"
              value={formData.sellerPhone}
              onChange={handleChange}
              placeholder="WhatsApp Number"
              required
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium text-gray-700">
              Upload Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full px-4 py-2 border rounded-xl shadow-sm"
            />

            {previewURL && (
              <img
                src={previewURL}
                alt="Preview"
                className="mt-4 rounded-xl w-full h-48 object-cover border shadow"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 rounded-xl font-semibold text-black text-lg shadow-md transition ${
              uploading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {uploading ? "Uploading..." : "🚀 Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
