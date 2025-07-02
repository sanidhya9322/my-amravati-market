import React, { useState } from "react";
import { storage, db, auth } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image.");
      return;
    }

    if (!auth.currentUser) {
      alert("You must be logged in to add a product.");
      return;
    }

    setUploading(true);

    try {
      const imageRef = ref(storage, `productImages/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      const productsRef = collection(db, "products");
      await addDoc(productsRef, {
        ...formData,
        price: parseFloat(formData.price),
        imageUrl,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });

      alert("Product added successfully✅!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Something went wrong. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-10 px-4 bg-gray-100 min-h-screen">
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
              <option>Books & Notes</option>
              <option>Handmade Goods</option>
              <option>Homemade Foods</option>
              <option>Second-hand Items</option>
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
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-3 rounded-lg font-semibold text-black transition ${
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
