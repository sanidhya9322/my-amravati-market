import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { createNotification } from "./notificationService";

/* ======================================================
   1️⃣ Get or Create Conversation
====================================================== */
export const getOrCreateConversation = async ({
  productId,
  productTitle,
  productImage,
  buyer,
  seller,
}) => {
  const conversationsRef = collection(db, "conversations");

  const q = query(
    conversationsRef,
    where("productId", "==", productId),
    where("buyerId", "==", buyer.uid),
    where("sellerId", "==", seller.uid)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  const docRef = await addDoc(conversationsRef, {
    productId,
    productTitle,
    productImage,

    buyerId: buyer.uid,
    buyerName: buyer.name || "Buyer",

    sellerId: seller.uid,
    sellerName: seller.name || "Seller",

    participants: [buyer.uid, seller.uid],

    lastMessage: "",
    lastMessageAt: serverTimestamp(),

    buyerUnread: 0,
    sellerUnread: 0,

    buyerTyping: false,
    sellerTyping: false,

    createdAt: serverTimestamp(),
    isBlocked: false,
  });

  return docRef.id;
};

/* ======================================================
   2️⃣ Send Message (SAFE + STATUS READY)
====================================================== */
export const sendMessage = async (conversationId, senderId, text) => {
  if (!text || !text.trim()) return;

  const conversationRef = doc(db, "conversations", conversationId);
  const messagesRef = collection(db, "conversations", conversationId, "messages");

  const convoSnap = await getDoc(conversationRef);
  if (!convoSnap.exists()) return;

  const convo = convoSnap.data();
  if (convo.isBlocked) return;

  const isBuyer = senderId === convo.buyerId;

  // 1️⃣ Message write — NEVER fail UX
  await addDoc(messagesRef, {
    senderId,
    text: text.trim(),
    createdAt: serverTimestamp(),
    status: "sent",
    type: "text",
    isDeleted: false,
  });

  // 2️⃣ Conversation metadata — SAFE update
  try {
    await updateDoc(conversationRef, {
      lastMessage: text.trim(),
      lastMessageAt: serverTimestamp(),
      buyerUnread: isBuyer ? 0 : increment(1),
      sellerUnread: isBuyer ? increment(1) : 0,
      buyerTyping: false,
      sellerTyping: false,
    });
  } catch (err) {
    console.warn("Conversation update failed:", err);
  }

  // 3️⃣ Notification — NEVER block send
  try {
    const receiverId = isBuyer ? convo.sellerId : convo.buyerId;

    await createNotification(receiverId, {
      title: "New message",
      message: text.length > 60 ? text.slice(0, 60) + "…" : text,
      type: "chat",
      link: `/messages/${conversationId}`,
    });
  } catch (err) {
    console.warn("Notification failed:", err);
  }
};

/* ======================================================
   3️⃣ Listen to Messages (Realtime)
====================================================== */
export const listenToMessages = (conversationId, callback) => {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages"
  );

  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(messages);
  });
};

/* ======================================================
   4️⃣ Listen to Inbox Conversations
====================================================== */
export const listenToConversations = (userId, callback) => {
  const conversationsRef = collection(db, "conversations");

  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(chats);
  });
};

/* ======================================================
   5️⃣ Typing Indicator Helpers (NEW)
====================================================== */
export const setTypingStatus = async (
  conversationId,
  userId,
  isTyping
) => {
  const convoRef = doc(db, "conversations", conversationId);
  const snap = await getDoc(convoRef);
  if (!snap.exists()) return;

  const convo = snap.data();

  if (userId === convo.buyerId) {
    await updateDoc(convoRef, { buyerTyping: isTyping });
  } else if (userId === convo.sellerId) {
    await updateDoc(convoRef, { sellerTyping: isTyping });
  }
};
// DELETE FOR ME
export const deleteMessageForMe = async (
  conversationId,
  messageId,
  userId
) => {
  const ref = doc(
    db,
    "conversations",
    conversationId,
    "messages",
    messageId
  );

  await updateDoc(ref, {
    isDeleted: true,
    deletedFor: "me",
    deletedBy: userId,
    deletedAt: serverTimestamp(),
  });
};

// UPDATED DELETE FOR EVERYONE (With sender check)
export const deleteMessageForEveryone = async (
  conversationId,
  messageId,
  userId
) => {
  const ref = doc(db, "conversations", conversationId, "messages", messageId);
  const snap = await getDoc(ref);

  // Security: Only allow sender to delete for everyone
  if (snap.exists() && snap.data().senderId === userId) {
    await updateDoc(ref, {
      isDeleted: true,
      deletedFor: "everyone",
      deletedBy: userId,
      deletedAt: serverTimestamp(),
    });
  } else {
    console.error("Unauthorized: You can only delete your own messages for everyone.");
  }
};