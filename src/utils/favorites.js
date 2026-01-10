import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

export const toggleFavorite = async (productId) => {
  if (!auth.currentUser) {
    alert("Please login first");
    return false;
  }

  const favRef = doc(
    db,
    "users",
    auth.currentUser.uid,
    "favorites",
    productId
  );

  const snap = await getDoc(favRef);

  if (snap.exists()) {
    // ❌ REMOVE
    await deleteDoc(favRef);
    return false;
  } else {
    // ❤️ ADD
    await setDoc(favRef, {
      productId,
      createdAt: serverTimestamp(),
    });
    return true;
  }
};
