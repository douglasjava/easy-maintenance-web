"use client";

import { ENV } from "@/lib/env";

export default function EnvironmentBanner() {
    if (ENV.APP_ENV === "production") return null;

    const label = ENV.APP_ENV === "staging" ? "AMBIENTE DE TESTES — staging" : `AMBIENTE LOCAL — ${ENV.APP_ENV}`;

    return (
        <div
            className="text-center py-1 small fw-semibold"
            style={{ backgroundColor: "#F59E0B", color: "#78350F" }}
        >
            ⚠ {label}
        </div>
    );
}
