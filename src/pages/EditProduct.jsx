import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    imageUrl: '',
  });
  const [newImageFile, setNewImageFile] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            location: data.location || '',
            category: data.category || '',
            imageUrl: data.imageUrl || '',
          });
        } else {
          alert('Product not found!');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        alert('Failed to load product');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) setNewImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productRef = doc(db, 'products', id);
      let updatedImageUrl = formData.imageUrl;

      if (newImageFile) {
        // Delete old image
        if (formData.imageUrl) {
          const oldImageRef = ref(storage, formData.imageUrl);
          await deleteObject(oldImageRef).catch(() => console.warn('Old image not found'));
        }

        // Upload new image
        const newImageRef = ref(storage, `productImages/${Date.now()}-${newImageFile.name}`);
        await uploadBytes(newImageRef, newImageFile);
        updatedImageUrl = await getDownloadURL(newImageRef);
      }

      await updateDoc(productRef, {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        category: formData.category,
        imageUrl: updatedImageUrl,
        updatedAt: serverTimestamp(),
      });

      alert('✅ Product updated successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Update error:', err);
      alert('❌ Failed to update product');
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-xl font-semibold mb-4">✏️ Edit Product</h2>
      {loading ? (
        <p>Loading product...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Product Title"
            className="form-control"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="form-control"
            required
          />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price ₹"
            className="form-control"
            required
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="form-control"
            required
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-control"
            required
          >
            <option value="">Select Category</option>
            <option>Books & Notes</option>
              <option>Handmade Items</option>
              <option>Homemade Food</option>
              <option>Second-hand Items</option>
              <option>New Items</option>
          </select>

          <label>Change Image (optional):</label>
          <input type="file" onChange={handleImageChange} className="form-control" />

          <button type="submit" className="btn btn-warning">Update Product</button>
        </form>
      )}
    </div>
  );
}

export default EditProduct;
