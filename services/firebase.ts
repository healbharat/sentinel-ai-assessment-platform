import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBPolCTkoINfyK2c8pdNDZ1OxP99gnz5Q0",
    authDomain: "assessment-platform-2bfc2.firebaseapp.com",
    projectId: "assessment-platform-2bfc2",
    storageBucket: "assessment-platform-2bfc2.appspot.com",
    messagingSenderId: "788157660468",
    appId: "1:788157660468:web:30a76a3b2e5ea88fa67961",
    measurementId: "G-XZEWK28CLK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics is optional for the core functionality but good to have initialized
import { getAnalytics } from "firebase/analytics";
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
