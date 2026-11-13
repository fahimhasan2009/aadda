// 1) Firebase Console > Project settings > Your apps > Web app থেকে config কপি করো.
// 2) নিচের placeholder-গুলো নিজের Firebase project-এর তথ্য দিয়ে বদলাও.
// এই ফাইল GitHub-এ public থাকলে Firebase Security Rules অবশ্যই ঠিকভাবে সেট করবে.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const firebaseConfigured = !Object.values(firebaseConfig).some(v => String(v).startsWith("YOUR_"));
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
