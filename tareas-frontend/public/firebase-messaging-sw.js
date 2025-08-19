importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCCBjexccxMjRTkBh0oWJ8jidpmOcYYtrc",
  authDomain: "tareas-a06d4.firebaseapp.com",
  projectId: "tareas-a06d4",
  storageBucket: "tareas-a06d4.firebasestorage.app",
  messagingSenderId: "348593626975",
  appId: "1:348593626975:web:230da3119c272c74d320ea",
});

const messaging = firebase.messaging();
