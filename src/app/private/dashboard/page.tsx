"use client";

import Link from "next/link";

const COLORS = {
    primary: "#0B5ED7",
    primaryDark: "#083B7A",
    bg: "#F3F4F6",
};

export default function PrivateDashboardPage() {
    return (
        <section style={{ backgroundColor: COLORS.bg }} className="p-3">
            <div className="mb-4">
                <h1 className="h4 m-0" style={{ color: COLORS.primaryDark }}>
                    Área Administrativa
                </h1>
                <p className="text-muted mt-1 mb-0">
                    Bem-vindo à área de administração global do sistema.
                </p>
            </div>

            <div className="row g-4">
                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title" style={{ color: COLORS.primaryDark }}>Organizações</h5>
                            <p className="card-text text-muted">Gerencie todas as organizações e planos contratados.</p>
                            <Link href="/private/organizations" className="btn btn-primary mt-auto">
                                Ver Organizações
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body d-flex flex-column">
                            <h5 className="card-title" style={{ color: COLORS.primaryDark }}>Usuários</h5>
                            <p className="card-text text-muted">Gerencie usuários administradores e operadores globais.</p>
                            <Link href="/private/users" className="btn btn-primary mt-auto">
                                Ver Usuários
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
