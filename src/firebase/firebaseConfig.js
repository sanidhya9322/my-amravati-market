import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyABuS5QsmCeSAUz6ZWrfMeN0J_FKPDVXgY",
  authDomain: "myamravati-market-4e7ca.firebaseapp.com",
  projectId: "myamravati-market-4e7ca",
  storageBucket: "myamravati-market-4e7ca.firebasestorage.app",
  messagingSenderId: "715944765731",
  appId: "1:715944765731:web:9947de8abf460b09a78496"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };