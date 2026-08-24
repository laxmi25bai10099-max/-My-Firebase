/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCoW9uZjmLlcDUjVHK_apv1B4HtBumCnAY",
  authDomain: "firebasics-3a494.firebaseapp.com",
  databaseURL: "https://firebasics-3a494-default-rtdb.firebaseio.com",
  projectId: "firebasics-3a494",
  storageBucket: "firebasics-3a494.firebasestorage.app",
  messagingSenderId: "794598944809",
  appId: "1:794598944809:web:4a7608d8632d5c390fac38",
  measurementId: "G-9C2SG850Y4"
};

// Firebase app initialize
firebase.initializeApp(firebaseConfig);

// Auth aur Firestore ke instances — poore app mein reuse honge
const auth = firebase.auth();
const db = firebase.firestore();