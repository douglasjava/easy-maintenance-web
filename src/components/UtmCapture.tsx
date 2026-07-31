"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureUtm } from "@/lib/utm";

/**
 * Renders nothing. Re-runs on every route change (usePathname, not
 * useSearchParams — avoids the Suspense-boundary requirement) so UTM
 * params are captured on hard loads and client-side navigations alike.
 */
export default function UtmCapture() {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === "undefined") return;
        captureUtm(window.location.search);
    }, [pathname]);

    return null;
}
