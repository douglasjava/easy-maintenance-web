import Link from "next/link";

export default function Home() {
  return (
    <section>
      <h1 className="h4 mb-1">Bem-vindo 👋</h1>
      <p className="text-muted">Acompanhe manutenções, prazos e histórico.</p>

      <div className="row g-3 my-2">
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Itens em dia</div>
              <div className="fw-bold fs-3">42</div>
              <div className="text-muted small">atualizado há 2h</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Vencendo em 30 dias</div>
              <div className="fw-bold fs-3">7</div>
              <div className="text-muted small">priorize estes</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-danger">
            <div className="card-body">
              <div className="text-muted small">Atrasados</div>
              <div className="fw-bold fs-3 text-danger">3</div>
              <div className="text-muted small">ação imediata</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="h6">Atalhos</h2>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-outline-secondary" href="/items">Ver Itens</Link>
            <Link className="btn btn-primary" href="/items/new">Novo Item</Link>
            <Link className="btn btn-outline-secondary" href="/maintenances/new">Registrar Manutenção</Link>
            <Link className="btn btn-outline-secondary" href="/organizations/new">Nova Organização</Link>
            <Link className="btn btn-outline-secondary" href="/users/new">Cadastro de Usuário</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
