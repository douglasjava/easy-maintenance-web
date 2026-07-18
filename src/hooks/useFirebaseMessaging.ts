import { useEffect, useState } from "react";
import { getToken, onMessage, Messaging } from "firebase/messaging";
import { getMessagingIfSupported } from "@/lib/firebase";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";

export function useFirebaseMessaging() {
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    const generateToken = async (messaging: Messaging) => {
        try {
            // A VAPID Key é necessária para identificar seu servidor de envio no navegador
            // Deve ser configurada no console do Firebase (Configurações do Projeto > Cloud Messaging)
            const currentToken = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });

            if (currentToken) {
                console.log("FCM Token gerado:", currentToken);
                setFcmToken(currentToken);

                // Persiste localmente para uso pós-login (vinculação ao usuário)
                try {
                    if (typeof window !== "undefined") {
                        window.localStorage.setItem("fcmToken", currentToken);
                    }
                } catch {}

                // Envia o token para o backend (registro do dispositivo)
                // Nota: esta rota não exige autenticação no exemplo do cURL.
                try {
                    await api.post("/push/tokens", {
                        token: currentToken,
                        platform: "WEB",
                        endpoint: typeof window !== "undefined" ? window.location.origin : "",
                        device_info: typeof navigator !== "undefined" ? navigator.userAgent : "",
                    });
                    console.log("Token FCM registrado no backend.");
                } catch (err) {
                    console.warn("Falha ao registrar token FCM no backend (tentará novamente após login):", err);
                }
            } else {
                console.log("Nenhum registration token disponível. Solicite permissão para gerar um.");
            }
        } catch (error) {
            console.error("Erro ao gerar token FCM:", error);
        }
    };

    const requestPermission = async (messaging: Messaging) => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            console.log("Este navegador não suporta notificações desktop");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                console.log("Permissão para notificações concedida.");
                await generateToken(messaging);
            } else {
                console.warn("Permissão para notificações negada.");
            }
        } catch (error) {
            console.error("Erro ao solicitar permissão de notificação:", error);
        }
    };

    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

        let unsubscribe: (() => void) | undefined;
        let cancelled = false;

        // getMessagingIfSupported() checa de forma assíncrona (via isSupported() do
        // próprio SDK) se o ambiente tem as APIs necessárias (Push API, Notification,
        // Service Worker). Em WebViews embutidos que não expõem essas APIs (Instagram,
        // Facebook, TikTok in-app browser no iOS), retorna null em vez de lançar
        // exceção — evita derrubar a hidratação da página nesses ambientes.
        getMessagingIfSupported().then((messaging) => {
            if (cancelled || !messaging) return;

            navigator.serviceWorker
                .register("/firebase-messaging-sw.js")
                .then((registration) => {
                    console.log("Service Worker registrado com sucesso:", registration.scope);
                })
                .catch((err) => {
                    console.error("Falha ao registrar o Service Worker:", err);
                });

            unsubscribe = onMessage(messaging, (payload) => {
                console.log("Mensagem recebida em foreground:", payload);
                if (payload.notification?.title) {
                    toast.success(`${payload.notification.title}: ${payload.notification.body}`, {
                        duration: 5000,
                        icon: '🔔'
                    });
                }
            });

            requestPermission(messaging);
        });

        return () => {
            cancelled = true;
            unsubscribe?.();
        };
    }, []);

    return { fcmToken };
}
