import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import './Home.css';

function Home() {
  // Refs and InView triggers for each card
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

      <motion.main
         className="text-center px-3 py-5 mx-auto"
         style={{ maxWidth: '600px' }}
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.7 }}


      >
        <h1 className="fw-bold mb-3 text-center text-3xl sm:text-4xl leading-tight px-3">
  🎉 Welcome to <br className="d-sm-none" /> MyAmravati Market   ✨
</h1>
        <p className="lead mb-4 w-100" style={{ maxWidth: '100%' }}>
          A digital bazaar for students, home entrepreneurs, and locals of the Amravati district.
          Buy and sell books, crafts, handmade food, second-hand items and more.
        </p>

        <motion.div
          className="d-flex gap-3 flex-wrap justify-content-center mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link to="/browse" className="btn btn-primary btn-lg shadow">Browse Products</Link>
          <Link to="/add-product" className="btn btn-outline-success btn-lg shadow">Add Your Product</Link>
        </motion.div>
      </motion.main>
<hr className="my-0 border-0" style={{ height: '1px', background: '#eee' }} />

      {/* === How It Works Section === */}
      <div className="bg-gray-100 py-16 px-4">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          How MyAmravati Market Works
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <motion.div
            ref={step1Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={step1InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="bg-white shadow-lg rounded-2xl p-6 text-center transition-transform hover:scale-105 duration-300"
           >
            <div className="text-5xl mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2">List Your Product</h3>
            <p className="text-gray-600">Upload a photo, set your price, write details, and share your WhatsApp number.</p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            ref={step2Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={step2InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
           className="bg-white shadow-lg rounded-2xl p-6 text-center transition-transform hover:scale-105 duration-300"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Browse & Contact</h3>
            <p className="text-gray-600">Buyers search local listings and chat directly with sellers via WhatsApp.</p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            ref={step3Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={step3InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
           className="bg-white shadow-lg rounded-2xl p-6 text-center transition-transform hover:scale-105 duration-300"
          >
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Deal & Deliver</h3>
            <p className="text-gray-600">Meet nearby, confirm the deal, and exchange items securely and quickly.</p>
          </motion.div>
        </div>

        {/* Call To Action Button */}
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
        <p className="mb-0"> MyAmravati Market • Made with ❤️ for Amravati</p>
        <div className="text-center text-sm mt-10 text-gray-500">
  <Link to="/terms" className="hover:underline">Terms & Conditions</Link> | 
  <Link to="/privacy" className="hover:underline ml-2">Privacy Policy</Link>
</div>
        <small>Built for Amravati | <a href="#" className="text-info text-decoration-none">Powered by you</a></small>
      </footer>
    </>
  );
}

export default Home;
