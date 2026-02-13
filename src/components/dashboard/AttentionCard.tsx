import { riskLevelLabelMap } from "@/lib/enums/labels";

interface AttentionItem {
  itemId: number;
  itemType: string;
  riskLevel: string;
  nextDueAt: string;
  status: string;
}

interface AttentionCardProps {
  items: AttentionItem[];
}

export function AttentionCard({ items }: AttentionCardProps) {
  function formatDate(dt?: string) {
    if (!dt) return "-";
    try {
      const d = new Date(dt + (dt.includes("T") ? "" : "T00:00:00"));
      return d.toLocaleDateString("pt-BR");
    } catch {
      return dt;
    }
  }

  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: "12px" }}>
      <div className="card-body p-4">
        <h3 className="h6 fw-bold mb-4 text-dark text-uppercase tracking-wide">Atenção Agora</h3>
        
        {items.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-0">Nenhuma manutenção crítica no momento.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-3 border-start border-4 border-danger bg-light d-flex justify-content-between align-items-center"
              >
                <div>
                  <div className="fw-bold text-dark">{item.itemType}</div>
                  <div className="small text-muted">
                    Risco: {riskLevelLabelMap[item.riskLevel] || item.riskLevel}
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-danger mb-1 d-block">Atrasado</span>
                  <div className="small text-muted fw-medium">{formatDate(item.nextDueAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
