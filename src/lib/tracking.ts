type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;

declare global {
    interface Window {
        fbq?: Fbq;
        gtag?: Gtag;
    }
}

// Meta Pixel base instalado (ver src/components/MetaPixel.tsx) — window.fbq já existe
// em produção com NEXT_PUBLIC_META_PIXEL_ID configurado.
// TODO(EPIC-018/TASK-156): Google Tag base ainda pendente do ID — window.gtag
// segue não existindo até lá, e a chamada abaixo continua um no-op seguro.

export function trackLead(): void {
    if (typeof window === "undefined") return;
    window.fbq?.("track", "Lead");
    window.gtag?.("event", "generate_lead");
}

export function trackContact(): void {
    if (typeof window === "undefined") return;
    window.fbq?.("track", "Contact");
    window.gtag?.("event", "contact");
}
