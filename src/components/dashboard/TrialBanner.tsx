"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface TrialBannerProps {
  trialExpiresAt?: string;
}

function computeDaysRemaining(trialExpiresAt?: string): number | null {
  if (!trialExpiresAt) return null;
  const now = Date.now();
  const expires = new Date(trialExpiresAt).getTime();
  const diffMs = expires - now;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

type Urgency = "info" | "warning" | "danger" | "expired";

function getUrgency(days: number | null): Urgency {
  if (days === null) return "info";
  if (days < 0) return "expired";
  if (days <= 3) return "danger";
  if (days <= 7) return "warning";
  return "info";
}

const URGENCY_STYLES: Record<Urgency, { alert: string; icon: string; badge: string }> = {
  info:    { alert: "alert-info border-info",       icon: "text-info",    badge: "bg-info" },
  warning: { alert: "alert-warning border-warning", icon: "text-warning", badge: "bg-warning text-dark" },
  danger:  { alert: "alert-danger border-danger",   icon: "text-danger",  badge: "bg-danger" },
  expired: { alert: "alert-danger border-danger",   icon: "text-danger",  badge: "bg-danger" },
};

const DISMISS_KEY = "trialBannerDismissed";

export function TrialBanner({ trialExpiresAt }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(DISMISS_KEY);
    if (stored === "1") setDismissed(true);
  }, []);

  const daysRemaining = computeDaysRemaining(trialExpiresAt);
  const urgency = getUrgency(daysRemaining);
  const styles = URGENCY_STYLES[urgency];

  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  const bannerText = () => {
    if (urgency === "expired") {
      return "Seu período de trial expirou. Ative um plano para continuar usando todos os recursos.";
    }
    if (daysRemaining === 0) {
      return "Seu trial expira hoje! Ative um plano para não perder o acesso.";
    }
    if (daysRemaining === 1) {
      return "Seu trial expira amanhã! Ative um plano para continuar com acesso completo.";
    }
    return `Seu trial expira em ${daysRemaining} dias. Ative um plano para continuar com acesso completo.`;
  };

  const bannerTitle = () => {
    if (urgency === "expired") return "Trial expirado";
    if (urgency === "danger") return "Trial expirando em breve!";
    if (urgency === "warning") return "Seu trial está acabando";
    return "Você está no período de trial";
  };

  return (
    <div
      className={`alert ${styles.alert} border-start border-3 shadow-sm mb-4 rounded-3 p-3 d-flex align-items-center justify-content-between`}
      role="alert"
    >
      <div className="d-flex align-items-center gap-3">
        <span className={`${styles.icon} flex-shrink-0`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
        <div>
          <div className="fw-semibold">{bannerTitle()}</div>
          <div className="small mb-0">{bannerText()}</div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 ms-3 flex-shrink-0">
        <Link href="/billing" className={`btn btn-sm fw-semibold px-3 ${styles.badge === "bg-warning text-dark" ? "btn-warning" : urgency === "info" ? "btn-outline-info" : "btn-danger"}`}>
          Ver planos
        </Link>
        <button
          type="button"
          className="btn-close"
          aria-label="Fechar"
          onClick={handleDismiss}
        />
      </div>
    </div>
  );
}
