// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import the authentication module

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIa9tTm3ruOAKYjgw15o7u_5bjyH3lH3M",
  authDomain: "inventory-management-afa46.firebaseapp.com",
  projectId: "inventory-management-afa46",
  storageBucket: "inventory-management-afa46.appspot.com",
  messagingSenderId: "1030386816925",
  appId: "1:1030386816925:web:d153e57c8f103012a64174",
  measurementId: "G-Y4Y0ERMCCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app); // Initialize the authentication module

// Export the firestore and auth instances
export { firestore, auth };