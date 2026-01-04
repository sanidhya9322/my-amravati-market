import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">

        {/* Brand */}
        <div>
          <h3 className="text-white font-bold text-lg mb-3">
            MyAmravati Market
          </h3>
          <p className="text-gray-400 leading-relaxed">
            Amravati’s own local marketplace to buy and sell products safely.
            Built for students, shop owners, and home entrepreneurs.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Explore</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/browse" className="hover:text-white">
                Browse Products
              </Link>
            </li>
            <li>
              <Link to="/add-product" className="hover:text-white">
                Sell a Product
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="hover:text-white">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/terms" className="hover:text-white">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <p className="text-gray-400">
            Email us for help or feedback
          </p>
          <a
            href="mailto:myamravatimart007@gmail.com"
            className="inline-block mt-2 text-blue-400 hover:underline"
          >
            myamravatimart007@gmail.com
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} MyAmravati Market. Built for Amravati.
      </div>
    </footer>
  );
};

export default Footer;
