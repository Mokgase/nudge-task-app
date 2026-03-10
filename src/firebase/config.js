import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA-1tzOBWpCTA9-pz3O0CYZpOsF0JVS8Mo",
  authDomain: "taskflow-daa2d.firebaseapp.com",
  projectId: "taskflow-daa2d",
  storageBucket: "taskflow-daa2d.firebasestorage.app",
  messagingSenderId: "279190399120",
  appId: "1:279190399120:web:a0ad5ff8ae0d7210cd5015",
  measurementId: "G-QHBT7QJTNS"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
