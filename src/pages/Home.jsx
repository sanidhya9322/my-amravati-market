import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <main className="bg-white">

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight"
        >
          Buy & Sell Locally in Amravati
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-gray-600 max-w-2xl mx-auto text-base sm:text-lg"
        >
          Books, handmade items, home food, second-hand goods & more.  
          Chat securely with local sellers — no phone numbers shared.
        </motion.p>

        <p className="mt-2 text-xs text-gray-500">
          Serving Amravati city & nearby areas only.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/browse"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-sm transition"
          >
            Browse Products
          </Link>

          <Link
            to="/add-product"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Start selling →
          </Link>
        </motion.div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="border-t border-b bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-gray-700">
          <div>🔒 Secure in-app chat</div>
          <div>👥 Only Amravati sellers</div>
          <div>🚫 No phone number sharing</div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          How MyAmravati Market Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "List or Browse Products",
              desc: "Post what you want to sell or explore local listings.",
              icon: "📦",
            },
            {
              title: "Chat Securely",
              desc: "Talk to buyers or sellers inside the platform.",
              icon: "💬",
            },
            {
              title: "Meet & Close the Deal",
              desc: "Meet locally and complete the exchange with trust.",
              icon: "🤝",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 text-center"
            >
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= WHO IS IT FOR ================= */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10">
            Built for Local People
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              🎓 <strong>Students</strong>
              <p className="mt-2 text-gray-600">
                Buy & sell books, notes, gadgets and essentials.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              🏪 <strong>Shop Owners</strong>
              <p className="mt-2 text-gray-600">
                Take your local shop online without extra cost.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              🏠 <strong>Home Entrepreneurs</strong>
              <p className="mt-2 text-gray-600">
                Sell homemade food, crafts and handmade items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Start Your Local Journey Today
        </h2>
        <p className="text-gray-600 mb-6">
          Join Amravati’s own digital marketplace.
        </p>

        <Link
          to="/browse"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-sm transition"
        >
          Explore Products
        </Link>
      </section>

    </main>
  );
};

export default Home;
