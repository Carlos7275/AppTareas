import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCCBjexccxMjRTkBh0oWJ8jidpmOcYYtrc",
  authDomain: "tareas-a06d4.firebaseapp.com",
  projectId: "tareas-a06d4",
  storageBucket: "tareas-a06d4.firebasestorage.app",
  messagingSenderId: "348593626975",
  appId: "1:348593626975:web:230da3119c272c74d320ea",
  measurementId: "G-6PS1CBJRY0"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);
export { app, analytics, messaging };