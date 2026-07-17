import Link from "next/link";

export default function PartnerBlock() {
  return (
    <section id="seja-parceiro" className="section-padding bg-white">
      <div className="container">
        <div
          className="mx-auto text-center rounded-4 p-4 p-md-5"
          style={{ maxWidth: 720, background: "#f0f9ff", border: "1px solid #bae6fd" }}
        >
          <span
            className="fw-bold text-uppercase"
            style={{ color: "#0369a1", letterSpacing: "0.08em", fontSize: "0.85rem" }}
          >
            Seja parceiro
          </span>
          <h2 className="h1 fw-bold mt-3 mb-3">Indique clientes, ganhe comissão</h2>
          <p className="text-muted mb-4">
            Conhece um síndico, uma administradora ou um gestor de facilities que precisa organizar a
            manutenção preventiva? Indique o Easy Maintenance com o seu link exclusivo e ganhe 20% de
            comissão sobre cada cliente que assinar.
          </p>
          <Link href="/indicador/novo" className="btn btn-primary btn-lg rounded-pill px-5">
            Quero ser parceiro
          </Link>
        </div>
      </div>
    </section>
  );
}
