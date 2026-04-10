"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "tourCompleted";

type Step = {
  selector: string | null;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
};

const STEPS: Step[] = [
  {
    selector: null,
    title: "Bem-vindo ao Easy Maintenance! 🎉",
    body: "Vamos fazer um tour rápido pelas principais funcionalidades. Leva menos de 1 minuto. Você pode pular a qualquer momento.",
  },
  {
    selector: '[data-tour="kpi-grid"]',
    title: "📊 Indicadores em tempo real",
    body: "Aqui você acompanha o total de itens, quantos estão vencidos, vencendo em breve e as manutenções realizadas no mês.",
  },
  {
    selector: '[data-tour="attention-card"]',
    title: "🚨 Atenção Agora",
    body: "Esta seção lista os itens que precisam de ação imediata — equipamentos com manutenção vencida ou com prazo crítico.",
  },
  {
    selector: '[data-tour="quick-actions"]',
    title: "⚡ Próximos passos",
    body: "Use as ações rápidas para cadastrar itens, registrar manutenções e configurar normas regulatórias. Comece pela criação de um item!",
    actionLabel: "Cadastrar primeiro item →",
    actionHref: "/items",
  },
];

type Rect = { top: number; left: number; width: number; height: number } | null;

export default function GuidedTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isCompleted = () => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(STORAGE_KEY) === "true";
  };

  useEffect(() => {
    if (!isCompleted()) {
      // Small delay so the dashboard finishes rendering
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const computeRect = useCallback((stepIdx: number) => {
    const selector = STEPS[stepIdx]?.selector;
    if (!selector) { setRect(null); return; }

    const el = document.querySelector(selector);
    if (!el) { setRect(null); return; }

    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  useEffect(() => {
    if (active) computeRect(step);
  }, [active, step, computeRect]);

  useEffect(() => {
    if (!active) return;
    const onResize = () => computeRect(step);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [active, step, computeRect]);

  function complete() {
    localStorage.setItem(STORAGE_KEY, "true");
    // Also mark the checklist "tour explored"
    try {
      const raw = localStorage.getItem("onboardingChecklist");
      const checklist = raw ? JSON.parse(raw) : {};
      localStorage.setItem("onboardingChecklist", JSON.stringify({ ...checklist, tourExplored: true }));
    } catch { /* ignore */ }
    setActive(false);
    setStep(0);
    setRect(null);
  }

  function next() {
    if (step >= STEPS.length - 1) { complete(); return; }
    setStep(s => s + 1);
  }

  function prev() {
    if (step > 0) setStep(s => s - 1);
  }

  function restart() {
    setStep(0);
    setActive(true);
  }

  // Tooltip position: below element if room, above if near bottom
  function tooltipStyle(): React.CSSProperties {
    if (!rect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10001,
        width: "min(400px, 90vw)",
      };
    }

    const gap = 16;
    const tooltipHeight = 220;
    const windowHeight = window.innerHeight;
    const fitsBelow = rect.top + rect.height + gap + tooltipHeight < windowHeight;

    const top = fitsBelow
      ? rect.top + rect.height + gap
      : Math.max(8, rect.top - tooltipHeight - gap);

    const centerX = rect.left + rect.width / 2;
    const tooltipWidth = Math.min(360, window.innerWidth * 0.9);
    const left = Math.max(8, Math.min(centerX - tooltipWidth / 2, window.innerWidth - tooltipWidth - 8));

    return {
      position: "fixed",
      top,
      left,
      width: tooltipWidth,
      zIndex: 10001,
    };
  }

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <>
      {/* Overlay */}
      {active && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 9998,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Highlight ring around target element */}
      {active && rect && (
        <div
          style={{
            position: "fixed",
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            borderRadius: 12,
            border: "3px solid #0d6efd",
            boxShadow: "0 0 0 4px rgba(13,110,253,0.25)",
            zIndex: 9999,
            pointerEvents: "none",
            transition: "all 0.3s ease",
          }}
        />
      )}

      {/* Tooltip card */}
      {active && (
        <div ref={tooltipRef} style={tooltipStyle()}>
          <div
            className="card border-0 shadow-lg"
            style={{ borderRadius: 14, overflow: "hidden" }}
          >
            {/* Progress bar */}
            <div style={{ height: 4, background: "#e9ecef" }}>
              <div
                style={{
                  height: "100%",
                  width: `${((step + 1) / STEPS.length) * 100}%`,
                  background: "#0d6efd",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <div className="card-body p-4">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="fw-bold mb-0" style={{ fontSize: "1rem" }}>
                  {currentStep.title}
                </h6>
                <button
                  className="btn btn-link text-muted p-0 border-0"
                  onClick={complete}
                  title="Pular tour"
                  style={{ lineHeight: 1 }}
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-muted mb-3" style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>
                {currentStep.body}
              </p>

              {/* Action link */}
              {isLast && currentStep.actionLabel && currentStep.actionHref && (
                <a
                  href={currentStep.actionHref}
                  className="btn btn-primary btn-sm w-100 mb-3"
                  onClick={complete}
                >
                  {currentStep.actionLabel}
                </a>
              )}

              {/* Footer */}
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  {step + 1} / {STEPS.length}
                </small>
                <div className="d-flex gap-2">
                  {step > 0 && (
                    <button className="btn btn-sm btn-outline-secondary" onClick={prev}>
                      ← Anterior
                    </button>
                  )}
                  <button
                    className={`btn btn-sm ${isLast ? "btn-success" : "btn-primary"}`}
                    onClick={next}
                  >
                    {isLast ? "Concluir ✓" : "Próximo →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "?" button to restart tour */}
      {!active && (
        <button
          onClick={restart}
          title="Relançar tour guiado"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "2px solid #0d6efd",
            background: "#fff",
            color: "#0d6efd",
            fontSize: "1.1rem",
            fontWeight: 700,
            cursor: "pointer",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ?
        </button>
      )}
    </>
  );
}
