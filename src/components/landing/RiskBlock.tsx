import CardCarousel from "./CardCarousel";

type RiskItem = {
  icon: "processo" | "multa" | "acidente";
  title: string;
  desc: string;
  source: string;
};

const RISK_ITEMS: RiskItem[] = [
  {
    icon: "processo",
    title: "Processo",
    desc: "Síndicos podem responder civil e criminalmente — inclusive com o próprio patrimônio — por acidentes ligados à falta de manutenção comprovada.",
    source: "Código Civil, Art. 1.348",
  },
  {
    icon: "multa",
    title: "Multa e interdição",
    desc: "A falta de laudo de segurança (AVCB) pode gerar multas de até R$ 265 mil e levar à interdição do prédio.",
    source: "Corpo de Bombeiros",
  },
  {
    icon: "acidente",
    title: "Acidente",
    desc: "No Brasil, uma pessoa morre em acidente de elevador a cada 10 dias — a maioria por falta de manutenção contínua.",
    source: "Seciesp",
  },
];

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function RiskIcon({ type }: { type: RiskItem["icon"] }) {
  if (type === "processo") {
    // Balança — símbolo jurídico, construída só com linhas retas e arcos simples
    return (
      <svg {...ICON_PROPS} width="22" height="22" aria-hidden="true">
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="5" y1="7" x2="19" y2="7" />
        <path d="M5 7 L2 13 A3 3 0 0 0 8 13 Z" />
        <path d="M19 7 L16 13 A3 3 0 0 0 22 13 Z" />
        <line x1="8" y1="21" x2="16" y2="21" />
      </svg>
    );
  }
  if (type === "multa") {
    // Octógono de alerta (placa de "pare") — remete a penalidade/interdição
    return (
      <svg {...ICON_PROPS} width="22" height="22" aria-hidden="true">
        <path d="M8 2.5h8L21.5 8v8L16 21.5H8L2.5 16V8Z" />
        <line x1="12" y1="8" x2="12" y2="13" />
        <circle cx="12" cy="16.25" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  // acidente — triângulo de alerta clássico
  return (
    <svg {...ICON_PROPS} width="22" height="22" aria-hidden="true">
      <path d="M12 3.5 L21.5 20 L2.5 20 Z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RiskCard({ icon, title, desc, source }: RiskItem) {
  return (
    <div
      className="h-100"
      style={{
        background: "#fef7f7",
        border: "1px solid #fecaca",
        borderLeft: "6px solid #ef4444",
        borderRadius: 10,
        padding: "1.75rem 1.5rem",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#ef4444",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <RiskIcon type={icon} />
      </div>
      <h4 className="h5 fw-bold">{title}</h4>
      <p className="text-muted mb-3">{desc}</p>
      <p className="mb-0" style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
        Fonte: {source}
      </p>
    </div>
  );
}

export default function RiskBlock() {
  return (
    <section id="risco-real" className="section-padding bg-white">
      <div className="container">
        <div className="text-center mb-5">
          <span
            className="fw-bold text-uppercase"
            style={{ color: "#ef4444", letterSpacing: "0.08em", fontSize: "0.85rem" }}
          >
            O risco real
          </span>
          <h2 className="display-5 fw-bold mt-3 mb-4">
            Falta de manutenção não é só bagunça na planilha — é risco jurídico, financeiro e humano
          </h2>
          <div
            className="d-inline-block px-4 py-3 rounded-3 mx-auto"
            style={{ backgroundColor: "#fef2f2", color: "#b91c1c", maxWidth: 640 }}
          >
            <p className="mb-1 fw-semibold">
              66% dos problemas em edificações no Brasil não vêm de defeito de construção. Vêm de falta de
              manutenção.
            </p>
            <p className="mb-0" style={{ fontSize: "0.72rem", opacity: 0.85 }}>
              Fonte: IBAPE Nacional
            </p>
          </div>
        </div>

        {/* Desktop: grid normal */}
        <div className="d-none d-md-block">
          <div className="row g-5">
            {RISK_ITEMS.map((item, index) => (
              <div key={index} className="col-md-4">
                <RiskCard {...item} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: carrossel */}
        <CardCarousel ariaLabel="Riscos de não ter a manutenção comprovada — deslize para o lado">
          {RISK_ITEMS.map((item, index) => (
            <RiskCard key={index} {...item} />
          ))}
        </CardCarousel>

        <p
          className="text-center mt-5 mb-0 fw-semibold"
          style={{ fontSize: "1.05rem", color: "#0f172a" }}
        >
          O Easy Maintenance existe pra isso: ter a prova de que a manutenção foi feita, antes que alguém
          precise perguntar depois que já deu errado.
        </p>
      </div>
    </section>
  );
}
