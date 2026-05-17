"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function PastDueBanner() {
  return (
    <div
      className="alert alert-danger border-start border-3 border-danger shadow-sm mb-4 rounded-3 p-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
      role="alert"
    >
      <div className="d-flex align-items-center gap-3">
        <AlertCircle size={22} className="text-danger flex-shrink-0" />
        <div>
          <div className="fw-semibold">Pagamento em atraso</div>
          <div className="small mb-0">
            Houve uma falha na renovação da sua assinatura. Atualize seu método de pagamento para recuperar o acesso completo.
          </div>
        </div>
      </div>

      <Link
        href="/billing/recover"
        className="btn btn-sm btn-danger fw-semibold px-3 flex-shrink-0"
      >
        Resolver agora
      </Link>
    </div>
  );
}
