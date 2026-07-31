type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;

declare global {
    interface Window {
        fbq?: Fbq;
        gtag?: Gtag;
    }
}

// TODO(EPIC-018/TASK-156): instalar o Meta Pixel base e o Google tag base —
// pendente dos IDs reais (Douglas). Até lá, window.fbq/window.gtag não
// existem e as funções abaixo são no-ops seguros.

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
