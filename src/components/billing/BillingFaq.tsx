"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Você pode cancelar sua assinatura a qualquer momento. O acesso permanece ativo até o final do período já pago.",
  },
  {
    q: "O que acontece quando atinjo o limite do meu plano?",
    a: "Quando você atinge o limite (ex: número máximo de itens), novas criações ficam bloqueadas até que você faça upgrade para um plano superior. Seus dados existentes continuam acessíveis.",
  },
  {
    q: "Posso fazer upgrade ou downgrade do plano?",
    a: "Sim. Você pode alterar seu plano a qualquer momento pela seção 'Itens da Assinatura'. O novo plano pode ser aplicado imediatamente ou no próximo ciclo de cobrança.",
  },
  {
    q: "Como funciona o período de trial?",
    a: "O trial é gratuito por tempo limitado e oferece acesso completo às funcionalidades do plano de entrada. Ao final do trial, você precisa escolher um plano pago para continuar usando.",
  },
  {
    q: "Os dados ficam seguros se eu cancelar?",
    a: "Sim. Seus dados ficam armazenados por 30 dias após o cancelamento. Após esse prazo, podem ser excluídos permanentemente.",
  },
  {
    q: "Como é feita a cobrança?",
    a: "A cobrança é mensal e processada automaticamente pelo cartão cadastrado. Você recebe uma fatura por e-mail após cada cobrança.",
  },
];

export default function BillingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-5">
      <h4 className="fw-bold mb-4">Perguntas frequentes sobre faturamento</h4>
      <div className="d-flex flex-column gap-2">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="card border rounded-4 overflow-hidden shadow-sm">
              <button
                className="btn text-start p-4 d-flex justify-content-between align-items-center w-100"
                style={{ background: isOpen ? "#f0f7ff" : "white" }}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
              >
                <span className="fw-semibold small">{item.q}</span>
                {isOpen ? <ChevronUp size={16} className="text-primary flex-shrink-0 ms-2" /> : <ChevronDown size={16} className="text-muted flex-shrink-0 ms-2" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-0 small text-muted" style={{ background: "#f0f7ff" }}>
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
