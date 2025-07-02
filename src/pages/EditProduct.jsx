import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../firebase/firebaseConfig';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '',
    location: '',
    category: '',
    imageURL: '',
  });
  const [newImageFile, setNewImageFile] = useState(null);

  // Load product data from Firestore
  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct(data);
        setFormData({
          productName: data.productName,
          description: data.description,
          price: data.price,
          location: data.location,
          category: data.category,
          imageURL: data.imageURL,
        });
      } else {
        alert('Product not found!');
        navigate('/dashboard');
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = e => {
    setNewImageFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const productRef = doc(db, 'products', id);

      // Upload new image if selected
      let updatedImageURL = formData.imageURL;

      if (newImageFile) {
        // Delete old image
        await deleteObject(ref(storage, formData.imageURL));

        // Upload new image
        const newImageRef = ref(storage, `productImages/${newImageFile.name}-${Date.now()}`);
        await uploadBytes(newImageRef, newImageFile);
        updatedImageURL = await getDownloadURL(newImageRef);
      }

      // Update Firestore
      await updateDoc(productRef, {
        ...formData,
        imageURL: updatedImageURL,
        updatedAt: serverTimestamp(),
      });

      alert('✅ Product updated!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('❌ Error updating product');
    }
  };

  return (
    <div className="container my-4">
      <h2>✏️ Edit Product</h2>

      {product ? (
        <form onSubmit={handleSubmit}>
          <input type="text" name="productName" value={formData.productName} onChange={handleChange} placeholder="Product Name" className="form-control mb-2" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="form-control mb-2" required />
          <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price ₹" className="form-control mb-2" required />
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="form-control mb-2" required />
          <select name="category" value={formData.category} onChange={handleChange} className="form-control mb-2" required>
            <option>Books & Notes</option>
            <option>Handmade Goods</option>
            <option>Homemade Foods</option>
            <option>Second-hand Items</option>
          </select>

          <label>Change Image (optional)</label>
          <input type="file" className="form-control mb-2" onChange={handleImageChange} />

          <button type="submit" className="btn btn-warning">Update Product</button>
        </form>
      ) : (
        <p>Loading product...</p>
      )}
    </div>
  );
}

export default EditProduct;
