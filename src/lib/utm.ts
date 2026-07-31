import Cookies from "js-cookie";

const UTM_COOKIE_NAME = "em_utm";
const UTM_COOKIE_EXPIRES_DAYS = 30;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/**
 * Reads utm_* params from a query string and persists them in the `em_utm`
 * cookie (30 days, same pattern as the existing `em_ref` affiliate cookie).
 * Never overwrites a stored value with an empty one — preserves first-touch
 * attribution across internal navigation that doesn't carry UTM params.
 */
export function captureUtm(search: string): void {
    const params = new URLSearchParams(search);
    const found: UtmParams = {};

    for (const key of UTM_KEYS) {
        const value = params.get(key);
        if (value) found[key] = value;
    }

    // If no new UTM params found, don't write the cookie
    if (Object.keys(found).length === 0) return;

    // Merge new params on top of previously stored values (preserves first-touch)
    const stored = getStoredUtm() || {};
    const merged = { ...stored, ...found };

    Cookies.set(UTM_COOKIE_NAME, JSON.stringify(merged), {
        expires: UTM_COOKIE_EXPIRES_DAYS,
        sameSite: "Lax",
    });
}

export function getStoredUtm(): UtmParams | undefined {
    const raw = Cookies.get(UTM_COOKIE_NAME);
    if (!raw) return undefined;

    try {
        return JSON.parse(raw) as UtmParams;
    } catch {
        return undefined;
    }
}
