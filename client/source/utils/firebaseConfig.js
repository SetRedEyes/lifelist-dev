import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCNBpqvMfM22TNNCc4AfSfVw7Z9DVhC3_8",
  authDomain: "lifelist-firebase.firebaseapp.com",
  projectId: "lifelist-firebase",
  storageBucket: "lifelist-firebase.firebasestorage.app",
  messagingSenderId: "986718104527",
  appId: "1:986718104527:web:bd26a21e720ed7995fc0ba",
  measurementId: "G-9EJWVZCX4P",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
