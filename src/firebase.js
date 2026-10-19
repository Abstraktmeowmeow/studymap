import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const keys = ['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_APP_ID'];
export const configured = keys.every(k=>!!import.meta.env[k]);
const firebaseConfig = {
 apiKey:import.meta.env.VITE_FIREBASE_API_KEY,
 authDomain:import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
 projectId:import.meta.env.VITE_FIREBASE_PROJECT_ID,
 appId:import.meta.env.VITE_FIREBASE_APP_ID,
 storageBucket:import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
};
const app = configured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export {signInWithPopup,signInWithRedirect,signOut,onAuthStateChanged,GoogleAuthProvider};
