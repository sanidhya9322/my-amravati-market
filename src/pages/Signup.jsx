import React, { useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [preferredCategory, setPreferredCategory] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!preferredLocation || !preferredCategory) {
      setError('Please select both location and category.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Save user preferences in Firestore
      await setDoc(doc(db, 'users', uid), {
        email,
        preferredLocation,
        preferredCategory,
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

        <select
          className="form-control my-2"
          value={preferredLocation}
          onChange={(e) => setPreferredLocation(e.target.value)}
          required
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

        <select
          className="form-control my-2"
          value={preferredCategory}
          onChange={(e) => setPreferredCategory(e.target.value)}
          required
        >
          <option value="">Select Preferred Category</option>
          <option value="📚 Books & Notes">📚 Books & Notes</option>
          <option value="🧵 Handmade Items">🧵 Handmade Items</option>
          <option value="🍱 Homemade Food">🍱 Homemade Food</option>
          <option value="♻️ Second-hand Items">♻️ Second-hand Items</option>
          <option value="🆕 New Items">🆕 New Items</option>
        </select>

        <button className="btn btn-success" type="submit">Signup</button>

        {error && <div className="text-danger mt-2">{error}</div>}
      </form>
    </div>
  );
}

export default Signup;
