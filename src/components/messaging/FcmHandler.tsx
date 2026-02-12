"use client";

import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";

/**
 * Componente responsável por ativar o Firebase Cloud Messaging.
 * Ele é renderizado apenas no lado do cliente dentro do Providers/Shell.
 */
export default function FcmHandler() {
    // O hook gerencia o registro do service worker, 
    // solicitação de permissão e geração de token.
    useFirebaseMessaging();

    // Este componente não renderiza nada visualmente.
    return null;
}
