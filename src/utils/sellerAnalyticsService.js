import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * 🧑‍💼 SELLER RESPONSE ANALYTICS
 * Admin-only, read-only
 * Determines seller responsiveness health
 */
export const fetchSellerResponseReport = async () => {
  const conversationsRef = collection(db, "conversations");
  const snapshot = await getDocs(conversationsRef);

  const conversations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const sellerMap = {};
  const NOW = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  conversations.forEach((conv) => {
    const {
      sellerId,
      sellerName,
      lastMessageAt,
      buyerUnread,
    } = conv;

    if (!sellerId) return;

    // Init seller bucket
    if (!sellerMap[sellerId]) {
      sellerMap[sellerId] = {
        sellerId,
        sellerName: sellerName || "Unknown seller",
        totalChats: 0,
        deadChats: 0,
      };
    }

    sellerMap[sellerId].totalChats += 1;

    // DEAD CHAT LOGIC
    // - Buyer has unread messages
    // - Last message older than 24 hours
    if (
      buyerUnread > 0 &&
      lastMessageAt?.toMillis &&
      NOW - lastMessageAt.toMillis() > DAY_MS
    ) {
      sellerMap[sellerId].deadChats += 1;
    }
  });

  // 🔄 Convert map to array with status calculation
  const report = Object.values(sellerMap).map((seller) => {
    const deadRatio =
      seller.totalChats > 0
        ? Math.round((seller.deadChats / seller.totalChats) * 100)
        : 0;

    let status = "Good";
    if (deadRatio > 40) status = "Very slow";
    else if (deadRatio >= 20) status = "Needs improvement";

    return {
      ...seller,
      deadRatio,
      status,
    };
  });

  // 🔽 Sort: worst sellers first
  report.sort((a, b) => b.deadRatio - a.deadRatio);

  return report;
};
