import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap
import { Toaster } from 'react-hot-toast'; // ✅ Use react-hot-toast

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {/* ✅ Hot-toast toaster */}
    <Toaster position="top-right" reverseOrder={false} />
  </React.StrictMode>,
);
