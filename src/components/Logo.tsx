"use client";

export default function Logo({ compact = false }: { compact?: boolean }) {
    return (
        <div className="logo">
            {/* SVG simples (pode trocar por /public/logo.svg depois) */}
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 2l7 4v6c0 5-3.5 7-7 10C8.5 19 5 17 5 12V6l7-4z" fill="currentColor" />
                <circle cx="12" cy="10" r="3" fill="#fff" />
            </svg>
            {!compact && <span className="logo-text">Easy&nbsp;Maintenance</span>}
        </div>
    );
}
