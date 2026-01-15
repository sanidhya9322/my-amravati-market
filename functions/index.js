// 🔔 Product Approved → Create Notifications (NO EMAIL / NO PUSH)
exports.notifyUsersOnProductApproval = onDocumentUpdated(
  "products/{productId}",
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const productId = event.params.productId;

    // ✅ 1️⃣ Only when approved changes from false → true
    if (before.approved === true || after.approved !== true) {
      console.log("Not a fresh approval, skipping notification");
      return;
    }

    console.log("Product approved, creating notifications");

    const productLocation = after.location;
    const productCategory = after.category;

    const usersSnap = await admin.firestore().collection("users").get();

    const batch = admin.firestore().batch();
    let notificationCount = 0;

    usersSnap.docs.forEach((doc) => {
      const user = doc.data();

      const preferredLocations = user.preferredLocations || [];
      const preferredCategories = user.preferredCategories || [];

      const locationMatch = preferredLocations.includes(productLocation);
      const categoryMatch = preferredCategories.includes(productCategory);

      // ✅ Location + Category match
      if (locationMatch && categoryMatch) {
        const notifRef = admin.firestore().collection("notifications").doc();

        batch.set(notifRef, {
          userId: doc.id,
          productId,
          type: "new_product",
          title: "🆕 New product near you",
          body: after.title,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        notificationCount++;
      }
    });

    if (notificationCount > 0) {
      await batch.commit();
    }

    console.log(`✅ ${notificationCount} notifications created`);
  }
);
// 🔔 MESSAGE NOTIFICATION (Buyer ↔ Seller)
exports.notifyOnNewMessage = onDocumentCreated(
  "conversations/{conversationId}/messages/{messageId}",
  async (event) => {
    const message = event.data.data();
    const { conversationId } = event.params;

    if (!message || !message.senderId) return;

    const convoRef = admin
      .firestore()
      .collection("conversations")
      .doc(conversationId);

    const convoSnap = await convoRef.get();
    if (!convoSnap.exists) return;

    const convo = convoSnap.data();

    // 🔍 Decide receiver
    const receiverId =
      message.senderId === convo.buyerId
        ? convo.sellerId
        : convo.buyerId;

    // 🛑 Safety
    if (!receiverId) return;

    // 🔔 Create notification
    await admin.firestore().collection("notifications").add({
      userId: receiverId,
      type: "message",
      title: "💬 New message",
      body: message.text?.slice(0, 80) || "New message received",
      conversationId,
      senderId: message.senderId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("Message notification sent to", receiverId);
  }
);
