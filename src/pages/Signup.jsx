import React, { useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [preferredCategories, setPreferredCategories] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleMultiSelect = (e, setFunc) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFunc(selected);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (preferredLocations.length === 0 || preferredCategories.length === 0) {
      setError('Please select at least one location and category.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        email,
        preferredLocations,
        preferredCategories,
        createdAt: new Date()
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Signup failed. Try again with a strong password.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          className="form-control my-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="form-control my-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Select Preferred Locations (Ctrl + Click for multiple):</label>
        <select
          multiple
          className="form-control my-2"
          value={preferredLocations}
          onChange={(e) => handleMultiSelect(e, setPreferredLocations)}
        >
          <option value="">Select Preferred Location</option>
          <option value="Achalpur">Achalpur</option>
          <option value="Amravati">Amravati</option>
          <option value="Anjangaon Surji">Anjangaon Surji</option>
          <option value="Bhatkuli">Bhatkuli</option>
          <option value="Chandur Bazar">Chandur Bazar</option>
          <option value="Chandur Railway">Chandur Railway</option>
          <option value="Chikhaldara">Chikhaldara</option>
          <option value="Daryapur">Daryapur</option>
          <option value="Dhamangaon Railway">Dhamangaon Railway</option>
          <option value="Dharni">Dharni</option>
          <option value="Morshi">Morshi</option>
          <option value="Nandgaon Khandeshwar">Nandgaon Khandeshwar</option>
          <option value="Teosa">Teosa</option>
          <option value="Warud">Warud</option>
        </select>

        <label>Select Preferred Categories:</label>
        <select
          multiple
          className="form-control my-2"
          value={preferredCategories}
          onChange={(e) => handleMultiSelect(e, setPreferredCategories)}
        >
          <option value="">Select Preferred Category</option>
          <option value="📚 Books & Notes">📚 Books & Notes</option>
          <option value="🧵 Handmade Items">🧵 Handmade Items</option>
          <option value="🍱 Homemade Food">🍱 Homemade Food</option>
          <option value="♻ Second-hand Items">♻ Second-hand Items</option>
          <option value="🆕 New Items">🆕 New Items</option>
        </select>

        <button className="btn btn-success mt-2" type="submit">Signup</button>

        {error && <div className="text-danger mt-2">{error}</div>}
      </form>
    </div>
  );
}

export default Signup;
