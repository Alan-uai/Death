
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBs8w_08HlzIVnR9EYg8dbCyX0DCfVU1Y",
  authDomain: "death-3a297.firebaseapp.com",
  projectId: "death-3a297",
  storageBucket: "death-3a297.firebasestorage.app",
  messagingSenderId: "963392353376",
  appId: "1:963392353376:web:04a2f6374da1e99e18ff05",
  measurementId: "G-NKZ1CJZBZC"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
