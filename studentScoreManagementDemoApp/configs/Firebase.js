// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import Constants from 'expo-constants';
import { API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGE_SENDER_ID, APP_ID } from '@env';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGE_SENDER_ID,
  appId: APP_ID
};

// const firebaseConfig = {
//   apiKey: "AIzaSyBtB9tgWXyv4T3-X3RqCHlYc2KrNiXyjb8",
//   authDomain: "chatapp11-4c1bf.firebaseapp.com",
//   projectId: "chatapp11-4c1bf",
//   storageBucket: "chatapp11-4c1bf.appspot.com",
//   messagingSenderId: "310089416769",
//   appId: "1:310089416769:web:df8307635671f7c670c6c0"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const database = getFirestore(app);

export { auth, database };