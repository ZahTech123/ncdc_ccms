// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Firebase Auth

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAndUyCmSPbCxMdURAscelELuoBgpu9iOg",
  authDomain: "ncdc-city-management-system.firebaseapp.com",
  projectId: "ncdc-city-management-system",
  storageBucket: "ncdc-city-management-system.appspot.com",
  messagingSenderId: "751539950984",
  appId: "1:751539950984:web:a1b99caff02e5ebe65d63d",
  measurementId: "G-CD52R0CKKS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Auth
const auth = getAuth(app);

export { db, auth }; // Export db and auth for use in other files
export default app; // Optionally export app if needed