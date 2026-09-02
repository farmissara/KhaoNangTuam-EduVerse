import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ค่า Configuration จาก Firebase ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyCrnKgxAeM-Xq9acB-bTGPgaXOqCzwWkX4",
  authDomain: "khaonangtuam-eduverse.firebaseapp.com",
  projectId: "khaonangtuam-eduverse",
  storageBucket: "khaonangtuam-eduverse.firebasestorage.app",
  messagingSenderId: "486216638019",
  appId: "1:486216638019:web:351290948424c754bf3ef6",
  measurementId: "G-XTHT298LMH"
};

// เริ่มต้นใช้งาน Firebase และ Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);