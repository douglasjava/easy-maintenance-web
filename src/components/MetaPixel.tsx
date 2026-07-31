"use client";

import Script from "next/script";
import { ENV } from "@/lib/env";

/**
 * Base Meta Pixel install (EPIC-018/TASK-156). Loaded once in the root layout so
 * PageView fires site-wide; trackLead()/trackContact() (src/lib/tracking.ts) then
 * become real calls to window.fbq instead of no-ops. No-op entirely if the pixel
 * ID isn't configured (local dev, or if disabled).
 */
export default function MetaPixel() {
    if (!ENV.META_PIXEL_ID) return null;

    return (
        <>
            <Script id="meta-pixel-base" strategy="afterInteractive">
                {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${ENV.META_PIXEL_ID}');
                    fbq('track', 'PageView');
                `}
            </Script>
            <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${ENV.META_PIXEL_ID}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
        </>
    );
}
