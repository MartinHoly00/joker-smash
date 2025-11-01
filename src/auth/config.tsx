// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCo1uhmkgAWRwFhkKPR0zrSg1CD6DDzUug",
  authDomain: "joker-smash-9de16.firebaseapp.com",
  projectId: "joker-smash-9de16",
  storageBucket: "joker-smash-9de16.firebasestorage.app",
  messagingSenderId: "975052293033",
  appId: "1:975052293033:web:918eef7b972c04be70bab8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app); //for database
const auth = getAuth(app);

export { database, auth };
