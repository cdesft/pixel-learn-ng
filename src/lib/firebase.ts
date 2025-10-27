import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCn9N-eppKNAKQ9EvYsGnhb0nsiQTEcSno",
  authDomain: "demomask-7b1cf.firebaseapp.com",
  databaseURL: "https://demomask-7b1cf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "demomask-7b1cf",
  storageBucket: "demomask-7b1cf.firebasestorage.app",
  messagingSenderId: "783828014408",
  appId: "1:783828014408:web:5d62e354b8e44bcdfc4f7d",
  measurementId: "G-K607Y8CP4K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
