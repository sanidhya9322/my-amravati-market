import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <>
      <header className="navbar navbar-dark bg-dark px-4 py-2 justify-content-between">
        <span className="navbar-brand fw-bold fs-4">MyAmravati Market</span>
        <div>
          <Link to="/" className="text-white me-3 text-decoration-none">Home</Link>
          
        </div>
      </header>

      <main className="hero text-center d-flex flex-column justify-content-center align-items-center px-3">
        <h1 className="display-4 fw-bold mb-3">🎉Welcome to MyAmravati  Market✨ </h1>
        <p className="lead mb-4 w-100" style={{ maxWidth: '750px' }}>
          A digital bazaar for students, home entrepreneurs, and locals of the Amravati district.
          Buy and sell books, crafts, handmade food, second-hand items and more.
        </p>

        <div className="d-flex gap-3 flex-wrap justify-content-center mb-5">
          <Link to="/browse" className="btn btn-primary btn-lg shadow">Browse Products</Link>
          <Link to="/add-product" className="btn btn-outline-success btn-lg shadow">Add Your Product</Link>
        </div>
      </main>

{/* === How It Works Section === */}
<div className="bg-gray-100 py-16 px-4">
  <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
    How MyAmravati Market Works
  </h2>

  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
    {/* Step 1 */}
    <div className="bg-white shadow-lg rounded-2xl p-6 text-center transition-transform hover:scale-105 duration-300">
      <div className="text-5xl mb-4">📸</div>
      <h3 className="text-xl font-semibold mb-2">List Your Product</h3>
      <p className="text-gray-600">Upload a photo, set your price, write details, and share your WhatsApp number.</p>
    </div>

    {/* Step 2 */}
    <div className="bg-white shadow-lg rounded-2xl p-6 text-center transition-transform hover:scale-105 duration-300">
      <div className="text-5xl mb-4">🔍</div>
      <h3 className="text-xl font-semibold mb-2">Browse & Contact</h3>
      <p className="text-gray-600">Buyers search local listings and chat directly with sellers via WhatsApp.</p>
    </div>

    {/* Step 3 */}
    <div className="bg-white shadow-lg rounded-2xl p-6 text-center transition-transform hover:scale-105 duration-300">
      <div className="text-5xl mb-4">🤝</div>
      <h3 className="text-xl font-semibold mb-2">Deal & Deliver</h3>
      <p className="text-gray-600">Meet nearby, confirm the deal, and exchange items securely and quickly.</p>
    </div>
  </div>

  {/* Call To Action Button */}
  <div className="text-center mt-12">
    <a href="/add-product">
      <button className="bg-blue-600 hover:bg-blue-700 text-black font-semibold px-6 py-3 rounded-xl shadow-md transition">
        Start Selling Now
      </button>
    </a>
  </div>
</div>
{/* === Support Section === */}
<div className="bg-white py-10 px-4 border-t border-gray-200">
  <div className="max-w-4xl mx-auto text-center">
    <h3 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h3>
    <p className="text-gray-600 mb-6">
      Facing issues or have questions? We’re here to help you 24/7.
    </p>
    <a
      href="mailto:myamravatimart007@gmail.com?subject=Support Request – MyAmravati Market"
      className="inline-block bg-blue-600 hover:bg-blue-700 text-black font-semibold px-6 py-3 rounded-xl transition shadow-md"
    >
      Email Us: myamravatimart007@gmail.com
    </a>
  </div>
</div>

      <footer className="bg-dark text-white text-center py-3">
        <small>© 2025 MyAmravati Market</small>
        <p className="mb-0"> MyAmravati Market • Made with ❤️ for Amravati</p>
        <br />
        <small>Built for Amravati | <a href="#" className="text-info text-decoration-none">Powered by you</a></small>
      </footer>
    </>
  );
}

export default Home;
