import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getMessaging, isSupported, Messaging } from "firebase/messaging";

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
const app: FirebaseApp | null = typeof window !== "undefined"
    ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
    : null;

// getMessaging() lança exceção síncrona (messaging/unsupported-browser) em
// ambientes sem Push API / Notification / Service Worker completos — caso de
// WebViews embutidos (Instagram, Facebook, TikTok in-app browser no iOS).
// getMessagingIfSupported() faz essa checagem de forma assíncrona e segura,
// para nunca derrubar a hidratação da página nesses ambientes.
export async function getMessagingIfSupported(): Promise<Messaging | null> {
    if (!app) return null;

    try {
        const supported = await isSupported();
        if (!supported) return null;

        return getMessaging(app);
    } catch (error) {
        console.warn("Firebase Messaging não suportado neste navegador:", error);
        return null;
    }
}

export default app;
