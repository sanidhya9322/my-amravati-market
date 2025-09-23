import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

function Home() {
  // Refs for scroll animations
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);

  const step1InView = useInView(step1Ref, { once: true });
  const step2InView = useInView(step2Ref, { once: true });
  const step3InView = useInView(step3Ref, { once: true });

  return (
    <>
      {/* === Navbar === */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 text-white flex justify-between items-center px-6 py-3 shadow-md"
      >
        <span className="font-bold text-lg sm:text-xl">
          MyAmravati Market
        </span>
        <nav className="space-x-4 text-sm sm:text-base">
          <Link to="/" className="hover:text-blue-400 transition">
            Home
          </Link>
          <Link to="/browse" className="hover:text-blue-400 transition">
            Browse
          </Link>
          <Link to="/add-product" className="hover:text-blue-400 transition">
            Sell
          </Link>
        </nav>
      </motion.header>

      {/* === Hero Section === */}
      <motion.section
        className="text-center px-4 py-16 bg-gradient-to-r from-blue-50 to-green-50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="font-bold text-3xl sm:text-5xl mb-4 leading-tight">
          🎉 Welcome to <br className="sm:hidden" />{" "}
          <span className="text-blue-600">MyAmravati Market ✨</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6 text-base sm:text-lg">
          A digital bazaar for students, home entrepreneurs, and locals of the
          Amravati district. Buy and sell books, crafts, handmade food,
          second-hand items, and more.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/browse"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
          >
            Browse Products
          </Link>
          <Link
            to="/add-product"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
          >
            Add Your Product
          </Link>
        </div>
      </motion.section>

      {/* === How It Works === */}
      <section className="bg-gray-100 py-16 px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">
          How MyAmravati Market Works
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <motion.div
            ref={step1Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={step1InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transform transition duration-300"
          >
            <div className="text-5xl mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2">List Your Product</h3>
            <p className="text-gray-600">
              Upload a photo, set your price, write details, and share your
              WhatsApp number.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            ref={step2Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={step2InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transform transition duration-300"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Browse & Contact</h3>
            <p className="text-gray-600">
              Buyers search local listings and chat directly with sellers via
              WhatsApp.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            ref={step3Ref}
            initial={{ opacity: 0, y: 50 }}
            animate={step3InView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transform transition duration-300"
          >
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Deal & Deliver</h3>
            <p className="text-gray-600">
              Meet nearby, confirm the deal, and exchange items securely and
              quickly.
            </p>
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <Link to="/add-product">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
            >
              Start Selling Now
            </motion.button>
          </Link>
        </div>
      </section>

      {/* === Support Section === */}
      <motion.section
        className="bg-white py-16 px-6 border-t border-gray-200"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-6">
            Facing issues or have questions? We’re here to help you 24/7.
          </p>
          <a
            href="mailto:myamravatimart007@gmail.com?subject=Support Request – MyAmravati Market"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
          >
            Email Us: myamravatimart007@gmail.com
          </a>
        </div>
      </motion.section>

      {/* === Footer === */}
      <footer className="bg-gray-900 text-gray-300 text-center py-6">
        <p className="mb-2">
          © 2025 MyAmravati Market • Made with ❤️ for Amravati
        </p>
        <div className="space-x-3 text-sm">
          <Link to="/terms" className="hover:underline">
            Terms & Conditions
          </Link>
          <Link to="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
        <p className="mt-2 text-xs">
          Built for Amravati |{" "}
          <a href="#" className="text-blue-400 hover:underline">
            Powered by you
          </a>
        </p>
      </footer> 
    </>
  );
}

export default Home;
