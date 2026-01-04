import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * 📊 CHAT ANALYTICS SERVICE
 * Admin-only, read-only, zero extra cost
 */
export const fetchChatAnalytics = async () => {
  const conversationsRef = collection(db, "conversations");
  const snapshot = await getDocs(conversationsRef);

  const conversations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const totalConversations = conversations.length;

  let deadConversations = 0;
  let sellerResponseTimes = [];
  const productChatMap = {};

  const NOW = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  conversations.forEach((conv) => {
    const {
      createdAt,
      lastMessageAt,
      buyerUnread,
      sellerUnread,
      productId,
      productTitle,
      buyerId,
      sellerId,
    } = conv;

    // 💤 DEAD CONVERSATIONS
    // Condition:
    // - Unread exists
    // - Last message older than 24 hrs
    if (
      lastMessageAt?.toMillis &&
      (buyerUnread > 0 || sellerUnread > 0) &&
      NOW - lastMessageAt.toMillis() > DAY_MS
    ) {
      deadConversations++;
    }

    // ⏱ SELLER RESPONSE TIME (APPROX)
    // If seller has replied at least once
    if (
      createdAt?.toMillis &&
      lastMessageAt?.toMillis &&
      sellerUnread === 0 // means seller replied at some point
    ) {
      const responseMinutes =
        (lastMessageAt.toMillis() - createdAt.toMillis()) / (1000 * 60);

      if (responseMinutes > 0 && responseMinutes < 10080) {
        // ignore insane values (>7 days)
        sellerResponseTimes.push(responseMinutes);
      }
    }

    // 🔥 TOP PRODUCTS BY CHAT
    if (productId) {
      if (!productChatMap[productId]) {
        productChatMap[productId] = {
          productId,
          productTitle: productTitle || "Unknown product",
          chatCount: 1,
        };
      } else {
        productChatMap[productId].chatCount++;
      }
    }
  });

  // 📐 Average seller response time
  const avgSellerResponseMinutes =
    sellerResponseTimes.length > 0
      ? Math.round(
          sellerResponseTimes.reduce((a, b) => a + b, 0) /
            sellerResponseTimes.length
        )
      : 0;

  // 🔝 Sort top products
  const topProducts = Object.values(productChatMap)
    .sort((a, b) => b.chatCount - a.chatCount)
    .slice(0, 10);

  return {
    totalConversations,
    deadConversations,
    avgSellerResponseMinutes,
    topProducts,
  };
};
