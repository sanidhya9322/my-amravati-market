/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Global settings
setGlobalOptions({ maxInstances: 10 });

// Initialize Firebase Admin SDK
admin.initializeApp();

// Nodemailer configuration (use environment variables in production)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your.email@gmail.com",
    pass: "your-app-password"
  }
});

// Example test HTTP function (can delete later)
exports.helloWorld = onRequest((req, res) => {
  logger.info("Hello logs!", { structuredData: true });
  res.send("Hello from Firebase!");
});

// Wishlist Notification Function
exports.sendWishlistNotification = functions.firestore
  .document("products/{productId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Trigger if price changes or stock is low
    if (newData.price !== oldData.price || newData.stock < 3) {
      const productId = context.params.productId;

      const wishlists = await admin.firestore()
        .collectionGroup("wishlist")
        .where("productId", "==", productId)
        .get();

      wishlists.forEach(async doc => {
        const userEmail = doc.data().userEmail;

        await transporter.sendMail({
          from: '"MyAmravati Market" <your.email@gmail.com>',
          to: userEmail,
          subject: "🔔 Update on your Wishlist Item!",
          html: `
            <p>Hi there!</p>
            <p>Your wishlist item <strong>${newData.title}</strong> has an update:</p>
            <ul>
              ${newData.price !== oldData.price ? `<li>💰 New Price: ₹${newData.price}</li>` : ""}
              ${newData.stock < 3 ? `<li>⚠️ Only ${newData.stock} items left!</li>` : ""}
            </ul>
            <a href="https://myamravati-market.netlify.app/product/${productId}">View Product</a>
          `
        });
      });
    }
  });
