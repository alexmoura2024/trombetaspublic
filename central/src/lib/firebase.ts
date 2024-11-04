import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDY368gvtStmnLKSpOSVT8Z-TGvi9iApoY",
  authDomain: "church-management-4c361.firebaseapp.com",
  projectId: "church-management-4c361",
  storageBucket: "church-management-4c361.firebasestorage.app",
  messagingSenderId: "1077320686391",
  appId: "1:1077320686391:web:920082b6f0b72b31b618b2"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser doesn\'t support persistence.');
  }
});