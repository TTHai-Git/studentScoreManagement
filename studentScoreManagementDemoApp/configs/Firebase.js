// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxuGEtm6B_3gc68lRDTtbEy9O0rYsv9Xg",
  authDomain: "chatappstudentscoremanagement.firebaseapp.com",
  databaseURL: "https://chatappstudentscoremanagement-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chatappstudentscoremanagement",
  storageBucket: "chatappstudentscoremanagement.appspot.com",
  messagingSenderId: "579959345986",
  appId: "1:579959345986:web:4ba28b10023f5dcffb2edb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);

export { auth, database };