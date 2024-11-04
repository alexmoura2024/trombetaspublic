import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCzFGLNNMBMjssTdisGxXILb3ljtqxH2xA",
  authDomain: "icm-13-de-maio.firebaseapp.com",
  projectId: "icm-13-de-maio",
  storageBucket: "icm-13-de-maio.firebasestorage.app",
  messagingSenderId: "299063253526",
  appId: "1:299063253526:web:927e7eae3b3d560c277337"
};
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings to avoid timestamp conversion issues
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true,
});
