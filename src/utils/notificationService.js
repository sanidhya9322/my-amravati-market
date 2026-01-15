import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/* =====================================================
   1️⃣ CREATE NOTIFICATION (STEP 2)
===================================================== */
export const createNotification = async (userId, data) => {
  if (!userId) return;

  const ref = collection(db, "users", userId, "notifications");

  await addDoc(ref, {
    title: data.title || "Notification",
    message: data.message || "",
    type: data.type || "system",
    link: data.link || null,

    isRead: false,
    createdAt: serverTimestamp(),
  });
};

/* =====================================================
   2️⃣ LISTEN TO UNREAD NOTIFICATIONS (STEP 4)
===================================================== */
export const listenToNotifications = (userId, callback) => {
  if (!userId) return () => {};

  const ref = collection(db, "users", userId, "notifications");

  const q = query(
    ref,
    where("isRead", "==", false),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(notifications);
  });
};

/* =====================================================
   3️⃣ MARK NOTIFICATION AS READ
===================================================== */
export const markNotificationRead = async (userId, notifId) => {
  if (!userId || !notifId) return;

  const ref = doc(db, "users", userId, "notifications", notifId);
  await updateDoc(ref, { isRead: true });
};
