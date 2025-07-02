// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8fDAeTGk5InDi5SRRKUp0VPb1yup-C7s",
  authDomain: "myamravati-market-92c93.firebaseapp.com",
  projectId: "myamravati-market-92c93",
  storageBucket: "myamravati-market-92c93.firebasestorage.app",
  messagingSenderId: "811479323320",
  appId: "1:811479323320:web:9a89910606059efe049a4d",
  measurementId: "G-MZSJSFP7PK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };