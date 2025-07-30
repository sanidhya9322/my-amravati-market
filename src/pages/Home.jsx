import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import './Home.css';
import marketwomen from '../assets/market-women.png'; // Adjust path if needed

function Home() {
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const step1InView = useInView(step1Ref, { once: true });
  const step2InView = useInView(step2Ref, { once: true });
  const step3InView = useInView(step3Ref, { once: true });

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="navbar navbar-dark bg-dark px-4 py-2 justify-content-between"
      >
        <span className="navbar-brand fw-bold fs-4">MyAmravati Market</span>
        <div>
          <Link to="/" className="text-white me-3 text-decoration-none">Home</Link>
        </div>
      </motion.header>

      {/* === Hero Section with Gradient Background & Image === */}
      <motion.section
        className="px-4 py-5 text-center"
        style={{
          background: 'linear-gradient(to bottom, #f6fbff, #ffffff)',
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="fw-bold mb-3 text-3xl sm:text-4xl leading-tight">
          🎉 Welcome to <br className="d-sm-none" /> MyAmravati Market ✨
        </h1>
        <p className="lead mb-4 px-2" style={{ maxWidth: '600px' }}>
          A digital bazaar for students, home entrepreneurs, and locals of the Amravati district.
          Buy and sell books, crafts, handmade food, second-hand items and more.
        </p>

        <div className="d-flex gap-3 flex-wrap justify-content-center mb-4">
          <Link to="/browse" className="btn btn-primary btn-lg shadow">Browse Products</Link>
          <Link to="/add-product" className="btn btn-outline-success btn-lg shadow">Add Your Product</Link>
        </div>

        {/* Woman Illustration */}
        <img
          src="/market-women.png"
          alt="Market Woman"
          style={{ maxWidth: '300px', width: '100%', marginTop: '30px' }}
        />
      </motion.section>

      <hr className="my-0 border-0" style={{ height: '1px', background: '#eee' }} />

      {/* === How It Works Section === */}
      <div className="bg-gray-100 py-16 px-4">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          How MyAmravati Market Works
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            ref={step1Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={step1InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition-transform"
          >
            <div className="text-5xl mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2">List Your Product</h3>
            <p className="text-gray-600">Upload a photo, set your price, write details, and share your WhatsApp number.</p>
          </motion.div>

          <motion.div
            ref={step2Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={step2InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition-transform"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Browse & Contact</h3>
            <p className="text-gray-600">Buyers search local listings and chat directly with sellers via WhatsApp.</p>
          </motion.div>

          <motion.div
            ref={step3Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={step3InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition-transform"
          >
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Deal & Deliver</h3>
            <p className="text-gray-600">Meet nearby, confirm the deal, and exchange items securely and quickly.</p>
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <a href="/add-product">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-blue-600 hover:bg-blue-700 text-black font-semibold px-6 py-3 rounded-xl shadow-md transition"
            >
              Start Selling Now
            </motion.button>
          </a>
        </div>
      </div>

      {/* === Support Section === */}
      <motion.div
        className="bg-white py-10 px-4 border-t border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
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
      </motion.div>

      <footer className="bg-dark text-white text-center py-3">
        <small>© 2025 MyAmravati Market</small>
        <p className="mb-0"> MyAmravati Market • Made with ❤ for Amravati</p>
        <br />
        <small>Built for Amravati | <a href="#" className="text-info text-decoration-none">Powered by you</a></small>
      </footer>
    </>
  );
}

export default Home;