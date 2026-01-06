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
  Timestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
/* ================= IMAGE UPLOAD ================= */
const uploadImages = async (files, userId) => {
  const urls = [];

  for (const file of files) {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `productImages/${userId}/${fileName}`);
    const snap = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snap.ref);
    urls.push(url);
  }

  return urls;
};
/* ================================================= */

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

  /* ===== AUTO LOCATION ===== */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        const place =
          data.address?.village ||
          data.address?.city ||
          data.address?.town ||
          "";
        if (place) {
          setFormData((p) => ({ ...p, location: place }));
        }
      } catch {}
    });
  }, []);

  /* ===== HANDLERS ===== */
  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    previewURLs.forEach(URL.revokeObjectURL);

    if (files.length > 6) {
      toast.error("You can upload maximum 6 images");
      return;
    }

    setImages(files);
    setPreviewURLs(files.map((f) => URL.createObjectURL(f)));
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(previewURLs[index]);
    setImages(images.filter((_, i) => i !== index));
    setPreviewURLs(previewURLs.filter((_, i) => i !== index));
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!auth.currentUser) {
    toast.error("Please login first");
    return;
  }

  if (!formData.title || !formData.description || !formData.price) {
    toast.error("Please fill all required fields");
    return;
  }

  if (images.length === 0) {
    toast.error("Please upload at least one image");
    return;
  }

  setUploading(true);

  try {
    /* 🔥 DAILY LIMIT CHECK */
    const q = query(
      collection(db, "products"),
      where("userId", "==", auth.currentUser.uid)
    );
    const snap = await getDocs(q);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = snap.docs.filter((d) => {
      const created = d.data().createdAt?.toDate?.();
      return created && created >= today;
    }).length;

    if (todayCount >= DAILY_LIMIT) {
      toast.error("Daily limit reached (3 products per day)");
      setUploading(false);
      return;
    }

    /* 🔥 IMAGE UPLOAD */
    const imageUrls = await uploadImages(images, auth.currentUser.uid);

    /* 🔥 SAVE PRODUCT (ADMIN SAFE) */
    await addDoc(collection(db, "products"), {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      location: formData.location,
      sellerPhone: formData.sellerPhone || null,

      imageUrls,

      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,

      approved: false,              // 🔴 VERY IMPORTANT
      promoted: false,
      promotionExpiresAt: null,

      createdAt: serverTimestamp(),
      createdAtClient: Timestamp.now(),
    });

    toast.success("Product added successfully 🎉");
    previewURLs.forEach(URL.revokeObjectURL);
    navigate("/dashboard");
  } catch (err) {
    console.error(err);
    toast.error("Failed to add product. Try again.");
  } finally {
    setUploading(false);
  }
};

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-4 py-10">


      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          📦 Add New Product
        </h2>
        <p className="text-center text-sm text-gray-500 mt-1">
          Post your product for Amravati buyers
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Product title"
            className="w-full px-4 py-3 border rounded-lg"
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Product description"
            rows={4}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="Price ₹"
              className="px-4 py-3 border rounded-lg"
              required
            />
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="px-4 py-3 border rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="px-4 py-3 border rounded-lg"
            >
              <option>Books & Notes</option>
              <option>Handmade Items</option>
              <option>Homemade Food</option>
              <option>Second-hand Items</option>
              <option>New Items</option>
              <option>From Shop</option>
            </select>

            <input
              name="sellerPhone"
              value={formData.sellerPhone}
              onChange={handleChange}
              placeholder="WhatsApp number (optional)"
              className="px-4 py-3 border rounded-lg"
            />
          </div>

          {/* IMAGES */}
          <div>
            <p className="text-sm font-medium mb-2">Product images (max 6)</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border rounded-lg px-3 py-2"
            />

            {previewURLs.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {previewURLs.map((url, i) => (
                  <div key={i} className="relative">
                    <img
                      src={url}
                      className="h-28 w-full object-cover rounded-lg"
                      alt=""
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRUST */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            🔒 Buyers will contact you via secure in-app chat.  
            Your phone number is not shown publicly.
          </div>

          <button
            disabled={uploading}
            className={`w-full py-3 rounded-xl text-white font-semibold ${
              uploading
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {uploading ? "Posting..." : "Post Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
