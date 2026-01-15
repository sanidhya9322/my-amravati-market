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

/**
 * 1️⃣ Get or Create Conversation
 * 1 buyer + 1 seller + 1 product = 1 thread
 */
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

    createdAt: serverTimestamp(),
    isBlocked: false,
  });

  return docRef.id;
};

/**
 * 2️⃣ Send Message (with unread + notification)
 */
export const sendMessage = async (conversationId, senderId, text) => {
  if (!text || !text.trim()) return;

  const conversationRef = doc(db, "conversations", conversationId);
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages"
  );

  // 🔐 Fetch conversation first
  const convoSnap = await getDoc(conversationRef);
  if (!convoSnap.exists()) return;

  const convo = convoSnap.data();

  if (convo.isBlocked) {
    throw new Error("Conversation is blocked");
  }

  // 1️⃣ Add message
  await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
    type: "text",
    isDeleted: false,
  });

  const isBuyer = senderId === convo.buyerId;

  // 2️⃣ Update conversation metadata (THIS triggers inbox realtime)
  await updateDoc(conversationRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    buyerUnread: isBuyer ? 0 : increment(1),
    sellerUnread: isBuyer ? increment(1) : 0,
  });

  // 3️⃣ 🔔 CREATE NOTIFICATION FOR RECEIVER
  const receiverId = isBuyer ? convo.sellerId : convo.buyerId;

  await createNotification(receiverId, {
    title: "New message",
    message: text.length > 60 ? text.slice(0, 60) + "…" : text,
    type: "chat",
    link: `/messages/${conversationId}`,
  });
};

/**
 * 3️⃣ Listen to Messages (Realtime)
 */
export const listenToMessages = (conversationId, callback) => {
  const messagesRef = collection(
    db,
    "conversations",
    conversationId,
    "messages"
  );

  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

/**
 * 4️⃣ Listen to Inbox Conversations
 */
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
