import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/**
 * Save / update FCM token for a user
 */
export const saveFcmToken = async (userId, token) => {
  if (!userId || !token) return;

  try {
    await setDoc(
      doc(db, "fcmTokens", userId),
      {
        token,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to save FCM token", err);
  }
};
