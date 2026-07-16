import CardCarousel from "./CardCarousel";

type RiskItem = {
  icon: string;
  title: string;
  desc: string;
  source: string;
};

const RISK_ITEMS: RiskItem[] = [
  {
    icon: "⚖️",
    title: "Processo",
    desc: "Síndicos podem responder civil e criminalmente — inclusive com o próprio patrimônio — por acidentes ligados à falta de manutenção comprovada.",
    source: "Código Civil, Art. 1.348",
  },
  {
    icon: "💰",
    title: "Multa e interdição",
    desc: "A falta de laudo de segurança (AVCB) pode gerar multas de até R$ 265 mil e levar à interdição do prédio.",
    source: "Corpo de Bombeiros",
  },
  {
    icon: "🚨",
    title: "Acidente",
    desc: "No Brasil, uma pessoa morre em acidente de elevador a cada 10 dias — a maioria por falta de manutenção contínua.",
    source: "Seciesp",
  },
];

function RiskCard({ icon, title, desc, source }: RiskItem) {
  return (
    <div className="card h-100 p-4" style={{ borderLeft: "4px solid #ef4444" }}>
      <div className="fs-3 mb-2">{icon}</div>
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
          <h2 className="display-6 fw-bold mt-3 mb-4">
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
        <CardCarousel>
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
