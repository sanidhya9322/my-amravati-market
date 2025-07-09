import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Browse from './pages/Browse';
import EditProduct from './pages/EditProduct';
import NotFound from './pages/NotFound';
import Favorites from './pages/Favorites';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/favorites" element={<Favorites />} />

        {/* ✅ Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
          />
          <Route
          path="/edit/:id"
          element={
             <ProtectedRoute>
               <EditProduct />
             </ProtectedRoute>
          }
        />
        <Route
  path="/favorites"
  element={
    <ProtectedRoute>
      <Favorites />
    </ProtectedRoute>
  }
/>
      </Routes>
    </Router>
  );
}

export default App;
