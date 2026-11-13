// 1) Firebase Console > Project settings > Your apps > Web app থেকে config কপি করো.
// 2) নিচের placeholder-গুলো নিজের Firebase project-এর তথ্য দিয়ে বদলাও.
// এই ফাইল GitHub-এ public থাকলে Firebase Security Rules অবশ্যই ঠিকভাবে সেট করবে.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDTBj-A9n-Rd3eP3fABkfffg2eh1Fd70NQ",
  authDomain: "adda-dc665.firebaseapp.com",
  projectId: "adda-dc665",
  storageBucket: "adda-dc665.firebasestorage.app",
  messagingSenderId: "625166806308",
  appId: "1:625166806308:web:5775298f534ae47a1957b1"
};

export const firebaseConfigured = !Object.values(firebaseConfig).some(v => String(v).startsWith("YOUR_"));
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
