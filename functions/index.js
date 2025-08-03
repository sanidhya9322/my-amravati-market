// ✅ Firebase v2 Function Triggers
const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated, onDocumentCreated } = require("firebase-functions/v2/firestore");

const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

setGlobalOptions({ maxInstances: 10 });
admin.initializeApp();

// ✅ Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_EMAIL@gmail.com",       // Replace with your Gmail address
    pass: "YOUR_APP_PASSWORD"           // Replace with App Password (not regular Gmail password)
  }
});

// ✅ Test Route
exports.helloWorld = onRequest((req, res) => {
  logger.info("Hello logs!", { structuredData: true });
  res.send("Hello from Firebase!");
});

// ✅ Wishlist Alert: Price drop or low stock
exports.sendWishlistNotification = onDocumentUpdated("products/{productId}", async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();

  if (after.price !== before.price || after.stock < 3) {
    const productId = event.params.productId;

    const wishlists = await admin.firestore()
      .collectionGroup("wishlist")
      .where("productId", "==", productId)
      .get();

    const emailPromises = wishlists.docs.map(async (doc) => {
      const userEmail = doc.data().userEmail;

      return transporter.sendMail({
        from: '"MyAmravati Market" <YOUR_EMAIL@gmail.com>',
        to: userEmail,
        subject: "🔔 Update on your Wishlist Item!",
        html: `
          <p>Hi there!</p>
          <p>Your wishlist item <strong>${after.title}</strong> has an update:</p>
          <ul>
            ${after.price !== before.price ? `<li>💰 New Price: ₹${after.price}</li>` : ""}
            ${after.stock < 3 ? `<li>⚠️ Only ${after.stock} items left!</li>` : ""}
          </ul>
          <a href="https://myamravati-market.netlify.app/product/${productId}">View Product</a>
        `
      });
    });

    return Promise.all(emailPromises);
  }
});

// ✅ New Product Notification: Match location or category
exports.notifyUsersOnNewProduct = onDocumentCreated("products/{productId}", async (event) => {
  const product = event.data.data();

  const userSnapshot = await admin.firestore().collection("users").get();

  const matchingUsers = userSnapshot.docs.filter((doc) => {
    const user = doc.data();
    return (
      user.location === product.location ||
      user.category === product.category
    );
  });

  const emailPromises = matchingUsers.map((doc) => {
    const user = doc.data();
    return transporter.sendMail({
      from: '"MyAmravati Market" <YOUR_EMAIL@gmail.com>',
      to: user.email,
      subject: "🆕 New Product in Your Area/Interest!",
      text: `A new item "${product.title}" was just listed in ${product.location} under ${product.category}. Check it out!`,
    });
  });

  return Promise.all(emailPromises);
});
