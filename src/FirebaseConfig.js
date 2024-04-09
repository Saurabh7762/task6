import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyAbLe37VqyHtQbH6wX-z-zbezY_iPuisbc",
  authDomain: "to-do-list-1a70a.firebaseapp.com",
  projectId: "to-do-list-1a70a",
  storageBucket: "to-do-list-1a70a.appspot.com",
  messagingSenderId: "228983672615",
  appId: "1:228983672615:web:02840dbc32de58cb47e302",
};

const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db= getFirestore(app);
export default app;