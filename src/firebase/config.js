import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAWcYM4FnBqhBRdE0BZ-KeKHnxGq0lHGlA",
    authDomain: "edbridge-ai.firebaseapp.com",
    projectId: "edbridge-ai",
    storageBucket: "edbridge-ai.firebasestorage.app",
    messagingSenderId: "861053401432",
    appId: "1:861053401432:web:c74add3175ed4b8a49cd2d",
    measurementId: "G-V89HN9D6H6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
