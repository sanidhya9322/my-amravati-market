// firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcMTrPRrddN84zbsoZZtKQ068wqOYJelY",
  authDomain: "myamravati-market-17248.firebaseapp.com",
  projectId: "myamravati-market-17248",
  storageBucket: "myamravati-market-17248.firebasestorage.app",
  messagingSenderId: "390266313293",
  appId: "1:390266313293:web:fe9ecb9eae7bcd05361a04",
};

// ✅ SINGLE Firebase App Instance (VERY IMPORTANT)
export const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

