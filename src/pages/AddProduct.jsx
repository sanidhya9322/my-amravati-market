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

// Data mapping talukas to villages
const talukaVillages = {
  Amravati: ["Amravati", "Badnera", "Walgaon", "Shendurjana"],
  Bhatkuli: ["Bhatkuli", "Kawatha", "Chandur", "Khamgaon"],
  "Nandgaon-Khandeshwar": ["Nandgaon-Khandeshwar", "Malegaon", "Belora", "Morshi"],
  "Chandur Bazar": ["Chandur Bazar", "Yevada", "Shirala", "Warud"],
  Daryapur: ["Daryapur", "Khallar", "Dhamangaon", "Adgaon"],
  Morshi: ["Morshi", "Warud", "Teosa", "Kurha"],
  Warud: ["Warud", "Shendurjana", "Nimbhora", "Zilpi"],
  "Dhamangaon Railway": ["Dhamangaon Railway", "Talegaon", "Jambha", "Shiur"],
  "Chandur Railway": ["Chandur Railway", "Talegaon", "Nandgaon", "Borgaon"],
  Anjangaon: ["Anjangaon", "Shendurjana", "Yevada", "Warud"],
  Achalpur: ["Achalpur", "Paratwada", "Warud", "Daryapur"],
  Teosa: ["Teosa", "Borgaon", "Malegaon", "Shendurjana"],
  Dharni: ["Dharni", "Chikhaldara", "Melghat", "Harisal"],
  Chikhaldara: ["Chikhaldara", "Semadoh", "Dharni", "Harisal"],
};

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Books & Notes",
    taluka: "",
    village: "",
    address: "",
    sellerPhone: "",
  });

  // State for the village search input
  const [searchTerm, setSearchTerm] = useState("");

  const [images, setImages] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);
  const [uploading, setUploading] = useState(false);
   const navigate = useNavigate();
  const DAILY_LIMIT = 3;

  // Handles input changes for all form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handles changes to the village search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setFormData((prev) => ({
      ...prev,
      village: "", // Clear village when searching
    }));
  };

  // Handles the selection of a village from the filtered list
  const handleSelectVillage = (village) => {
    setFormData((prev) => ({
      ...prev,
      village: village,
    }));
    setSearchTerm(""); // Clear search term after selection
  };

  // Filters villages based on selected taluka and search term
  const filteredVillages = formData.taluka
    ? talukaVillages[formData.taluka].filter(village =>
        village.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Handles image selection + preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 6) {
      toast.error("⚠️ You can upload up to 6 images only.");
      return;
    }
    setImages(files);
    setPreviewURLs(files.map((file) => URL.createObjectURL(file)));
  };

  // Submit product to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.price || !formData.taluka || !formData.village || !formData.address) {
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
      // Daily post limit check
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

      // Upload all images
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

      // Save product in Firestore
      await addDoc(productsRef, {
        ...formData,
        price: parseFloat(formData.price),
        district: "Amravati",
        state: "Maharashtra",
        pincode: 444601,
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
          {/* Price + Taluka + Village Search */}
          <div className="flex flex-col sm:flex-row gap-4 relative">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price (₹)"
              required
              className="flex-1 px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Taluka Dropdown */}
            <select
              name="taluka"
              value={formData.taluka}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Taluka --</option>
              {Object.keys(talukaVillages).map((taluka) => (
                <option key={taluka} value={taluka}>{taluka}</option>
              ))}
            </select>
            {/* Village Search Input - Renders only if a Taluka is selected */}
            {formData.taluka && (
              <div className="relative flex-1">
                <input
                  type="text"
                  name="villageSearch"
                  value={formData.village || searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search your village"
                  className="w-full px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Search Results List */}
                {searchTerm && filteredVillages.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredVillages.map((village, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSelectVillage(village)}
                      >
                        {village}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
           {/* Address */}
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="House No. / Street / Landmark"
            required
            className="w-full px-4 py-3 border rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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