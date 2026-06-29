import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { uploadImages, deleteImages } from "../utils/imageUpload";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "",
    sellerPhone: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [existingThumbnail, setExistingThumbnail] = useState("");

  const [newImages, setNewImages] = useState([]);
  const [previewURLs, setPreviewURLs] = useState([]);

  // Fetch Product Data
  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));

        if (!snap.exists()) {
          toast.error("Product not found");
          navigate("/dashboard");
          return;
        }

        const data = snap.data();

        if (!mounted) return;

        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          location: data.location || "",
          category: data.category || "",
          sellerPhone: data.sellerPhone || "",
        });

        if (Array.isArray(data.imageUrls)) {
          setExistingImages(data.imageUrls);
        } else if (data.imageUrl) {
          setExistingImages([data.imageUrl]);
        }

        setExistingThumbnail(data.thumbnailUrl || "");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
        navigate("/dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      mounted = false;
      previewURLs.forEach(URL.revokeObjectURL);
    };
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + newImages.length + files.length;

    if (totalImages > 6) {
      toast.error(`Maximum 6 images allowed. You can only add ${6 - (existingImages.length + newImages.length)} more.`);
      e.target.value = "";
      return;
    }

    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    setNewImages((prev) => [...prev, ...validFiles]);
    setPreviewURLs((prev) => [...prev, ...validFiles.map((file) => URL.createObjectURL(file))]);
    
    // Reset input so the same files can be selected again if removed
    e.target.value = "";
  };

  const handleRemoveNewImage = (index) => {
    URL.revokeObjectURL(previewURLs[index]);
    setNewImages(newImages.filter((_, i) => i !== index));
    setPreviewURLs(previewURLs.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;
    setUploading(true);

    try {
      const productRef = doc(db, "products", id);

      let imageUrls = existingImages;
      let thumbnailUrl = existingThumbnail;
      let shouldDeleteOldImages = false;

      if (newImages.length > 0) {
        const uploaded = await uploadImages(
          newImages,
          auth.currentUser.uid
        );

        imageUrls = [...existingImages, ...uploaded.imageUrls];
        thumbnailUrl = existingImages.length === 0 ? uploaded.thumbnailUrl : existingThumbnail; 
        
        // Note: Preserving user's original deletion logic flag
        shouldDeleteOldImages = true;
      }

      const updatePayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        location: formData.location,
        sellerPhone: formData.sellerPhone || null,
        imageUrls,
        thumbnailUrl,
        imageUrl: null, // Legacy migration
        updatedAt: serverTimestamp(),
      };

      await updateDoc(productRef, updatePayload);

      // Trigger deletion of old images if required based on previous logic structure
      if (shouldDeleteOldImages && existingImages.length === 0) {
         await deleteImages(existingImages, existingThumbnail);
      }

      previewURLs.forEach(URL.revokeObjectURL);
      toast.success("Product updated successfully 🎉");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to update product.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading product details...</p>
      </div>
    );
  }

  const totalCurrentImages = existingImages.length + newImages.length;
  const isMaxImages = totalCurrentImages >= 6;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">✏️ Edit Product</h2>
          <p className="mt-1 text-sm text-gray-500">Update your product listing details and images.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          {/* Section: Product Information */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  disabled={uploading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="e.g., iPhone 13 Pro Max"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  disabled={uploading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-y disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Describe your product's condition, features, and reason for selling..."
                />
              </div>
            </div>
          </section>

          {/* Section: Details & Pricing */}
          <section className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Details & Pricing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    disabled={uploading}
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  disabled={uploading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  disabled={uploading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>

              <div>
                <label htmlFor="sellerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  id="sellerPhone"
                  name="sellerPhone"
                  type="tel"
                  value={formData.sellerPhone}
                  onChange={handleChange}
                  disabled={uploading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </section>

          {/* Section: Images */}
          <section className="space-y-6">
            <div className="flex justify-between items-end border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {totalCurrentImages} / 6 Images
              </span>
            </div>

            {/* Existing Images Grid */}
            {existingImages.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Currently Uploaded</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-50">
                      <img 
                        src={url} 
                        alt={`Existing product ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          disabled={uploading}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-200"
                          aria-label="Remove existing image"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview Grid */}
            {newImages.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-green-600">New Images to Upload</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {newImages.map((file, index) => (
                    <div key={`new-${index}`} className="relative group rounded-xl overflow-hidden border-2 border-green-200 shadow-sm aspect-square bg-green-50 flex flex-col">
                      <img 
                        src={previewURLs[index]} 
                        alt={`New preview ${index + 1}`} 
                        className="w-full h-3/4 object-cover"
                      />
                      <div className="w-full h-1/4 bg-white p-2 flex flex-col justify-center border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-800 truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        disabled={uploading}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-500 p-1.5 rounded-full shadow-sm transition-colors"
                        aria-label="Remove new image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Dropzone */}
            {!isMaxImages && (
              <div className="mt-4">
                <label 
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    uploading 
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed" 
                      : "border-gray-300 bg-gray-50 hover:bg-green-50 hover:border-green-400"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                    <svg className={`w-12 h-12 mb-3 ${uploading ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold text-green-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG, WEBP (Max {6 - totalCurrentImages} more files)</p>
                  </div>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden" 
                    onChange={handleImageChange} 
                    disabled={uploading || isMaxImages} 
                    aria-label="Upload product images"
                  />
                </label>
              </div>
            )}
            
            {isMaxImages && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Maximum limit of 6 images reached. Remove an image to add a new one.
              </div>
            )}
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              disabled={uploading}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto px-8 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
              aria-label="Update product"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default EditProduct;