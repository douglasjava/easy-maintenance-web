"use client";

import { useEffect } from "react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { getStoredUtm } from "@/lib/utm";
import { trackLead, trackContact } from "@/lib/tracking";

const WHATSAPP_NUMBER = "5531999826634";

function buildWhatsAppLink(): string {
    const utm = getStoredUtm();
    const campaignContext = utm?.utm_campaign
        ? ` Vim através da campanha "${utm.utm_campaign}".`
        : "";
    const message =
        `Olá, tudo bem? Acabei de solicitar uma demonstração no site da Easy Maintenance e ` +
        `gostaria de falar agora, se possível.${campaignContext}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function ObrigadoContent() {
    useEffect(() => {
        trackLead();
    }, []);

    return (
        <>
            <h1 className="fw-bold mb-3">Recebemos sua solicitação!</h1>
            <p className="text-muted mb-4">
                Obrigado pelo interesse na Easy Maintenance. Nossa equipe vai entrar em contato pelo
                e-mail informado em breve para agendar sua demonstração.
            </p>
            <p className="text-muted mb-4">
                Se preferir não esperar, fale agora mesmo com um consultor:
            </p>
            <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-lg rounded-pill px-4 d-inline-flex align-items-center gap-2"
                onClick={() => trackContact()}
            >
                <WhatsAppIcon size={22} />
                Falar agora no WhatsApp
            </a>
        </>
    );
}
