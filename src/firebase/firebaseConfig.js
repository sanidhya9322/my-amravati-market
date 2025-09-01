// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCcMTrPRrddN84zbsoZZtKQ068wqOYJelY",
  authDomain: "myamravati-market-17248.firebaseapp.com",
  projectId: "myamravati-market-17248",
  storageBucket: "myamravati-market-17248.firebasestorage.app",
  messagingSenderId: "390266313293",
  appId: "1:390266313293:web:fe9ecb9eae7bcd05361a04"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };