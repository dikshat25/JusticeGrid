import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKxK_r6xPP3KQ6R0u12BVUiI0_1ptkV3A",
  authDomain: "justicegrid-287e1.firebaseapp.com",
  projectId: "justicegrid-287e1",
  storageBucket: "justicegrid-287e1.firebasestorage.app",
  messagingSenderId: "408695405551",
  appId: "1:408695405551:web:d66c094cb53860fbc6d41a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
