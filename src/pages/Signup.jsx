import React, { useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";


function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Signup failed. Try again with a strong password.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input type="email" placeholder="Email" className="form-control my-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="form-control my-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-success" type="submit">Signup</button>
        {error && <div className="text-danger mt-2">{error}</div>}
      </form>
    </div>
  );
  toast.success("Signup in successfully!");
toast.error("Invalid credentials!");

}

export default Signup;
