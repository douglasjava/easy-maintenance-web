"use client";

import { useEffect, useState } from "react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { getStoredUtm } from "@/lib/utm";
import { trackLead, trackContact } from "@/lib/tracking";

const WHATSAPP_NUMBER = "5531999826634";

function buildWhatsAppLink(campaign?: string): string {
    const campaignContext = campaign
        ? ` Vim através da campanha "${campaign}".`
        : "";
    const message =
        `Olá, tudo bem? Acabei de solicitar uma demonstração no site da Easy Maintenance e ` +
        `gostaria de falar agora, se possível.${campaignContext}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function ObrigadoContent() {
    // Starts as the base link (no cookie access) so server and hydration render match;
    // the UTM-enriched link is applied client-side right after mount. Reading the cookie
    // directly during render caused a permanent hydration mismatch on this static page —
    // React does not patch it up, so the campaign context never appeared.
    const [whatsappLink, setWhatsappLink] = useState(() => buildWhatsAppLink());

    useEffect(() => {
        trackLead();
        setWhatsappLink(buildWhatsAppLink(getStoredUtm()?.utm_campaign));
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
                href={whatsappLink}
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
