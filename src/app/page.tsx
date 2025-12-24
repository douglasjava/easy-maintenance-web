"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Verifica sessão no cliente: se não houver token/org, vai para /login
    try {
      const token = typeof window !== "undefined" ? window.localStorage.getItem("accessToken") : null;
      const org = typeof window !== "undefined" ? window.localStorage.getItem("organizationCode") : null;
      if (token && org) {
        setIsAuthed(true);
      } else {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    } finally {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return <p className="p-3 m-0">Carregando…</p>;
  }

  if (!isAuthed) {
    // Um frame intermediário até o router efetivar o replace
    return <p className="p-3 m-0">Redirecionando para login…</p>;
  }

  // Dashboard simples
  return (
    <section>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 m-0">Dashboard</h1>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6">Ações rápidas</h2>
              <div className="d-flex flex-column gap-2 mt-2">
                <Link className="btn btn-primary" href="/items/new">+ Cadastrar Item</Link>
                <Link className="btn btn-outline-primary" href="/maintenances/new">Registrar Manutenção</Link>
                <Link className="btn btn-outline-secondary" href="/items">Ver Itens</Link>
                <Link className="btn btn-outline-secondary" href="/maintenances">Ver Manutenções</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h2 className="h6">Bem-vindo(a)</h2>
              <p className="mb-0 text-muted">
                Utilize o menu para navegar. Este é um painel inicial simples. Em breve: indicadores e
                estatísticas sobre itens e manutenções.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
