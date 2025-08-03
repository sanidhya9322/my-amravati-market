// ✅ New Product Notification: Match any preferred location or category
exports.notifyUsersOnNewProduct = onDocumentCreated("products/{productId}", async (event) => {
  const product = event.data.data();
  const productLocation = product.location;
  const productCategory = product.category;

  const userSnapshot = await admin.firestore().collection("users").get();

  const matchingUsers = userSnapshot.docs.filter((doc) => {
    const user = doc.data();
    const preferredLocations = user.preferredLocations || [];  // ✅ Array
    const preferredCategories = user.preferredCategories || []; // ✅ Array

    const locationMatch = preferredLocations.includes(productLocation);
    const categoryMatch = preferredCategories.includes(productCategory);

    return locationMatch && categoryMatch;
  });

  const emailPromises = matchingUsers.map((doc) => {
    const user = doc.data();
    return transporter.sendMail({
      from: '"MyAmravati Market" <YOUR_EMAIL@gmail.com>',
      to: user.email,
      subject: "🆕 New Product in Your Area & Interest!",
      html: `
        <p>Hello!</p>
        <p>A new product <strong>${product.title}</strong> was just listed:</p>
        <ul>
          <li>📍 Location: ${productLocation}</li>
          <li>🛍️ Category: ${productCategory}</li>
        </ul>
        <a href="https://myamravati-market.netlify.app/product/${event.params.productId}">👉 View Product</a>
        <p>Thank you for using MyAmravati Market 💚</p>
      `,
    });
  });

  return Promise.all(emailPromises);
});
