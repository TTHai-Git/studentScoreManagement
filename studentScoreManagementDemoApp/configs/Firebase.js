// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBviIKu66r5ljr1FNqiUENml4lF0p6RDLo",
  authDomain: "chatappstudent.firebaseapp.com",
  projectId: "chatappstudent",
  storageBucket: "chatappstudent.appspot.com",
  messagingSenderId: "126587434289",
  appId: "1:126587434289:web:a904b8143855c5c9922c10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);

export { auth, database };