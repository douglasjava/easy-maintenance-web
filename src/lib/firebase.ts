import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Inicializa o Firebase apenas se estiver no lado do cliente
// e se ainda não foi inicializado.
const app = typeof window !== "undefined" 
    ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
    : null;

// Exporta a instância de messaging
// No SSR (Server Side Rendering), messaging não está disponível, por isso retornamos null ou tratamos via window
export const messaging = (typeof window !== "undefined" && app) 
    ? getMessaging(app) 
    : null;

export default app;
