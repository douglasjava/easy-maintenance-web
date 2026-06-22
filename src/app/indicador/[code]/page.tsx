"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { api } from '@/lib/apiClient';

interface Lead {
  maskedEmail: string;
  status: string;
  date: string;
}

interface Dashboard {
  name: string;
  code: string;
  link: string;
  totalLeads: number;
  totalConverted: number;
  pendingAmount: number;
  paidAmount: number;
  leads: Lead[];
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function AffiliateDashboardPage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Dashboard>(`/affiliates/${code}/dashboard`)
      .then(res => setData(res.data))
      .catch(() => setError('Painel não encontrado. Verifique o link ou cadastre-se como afiliado.'))
      .finally(() => setLoading(false));
  }, [code]);

  const copyLink = async () => {
    if (!data?.link) return;
    try {
      await navigator.clipboard.writeText(data.link);
      alert('Link copiado!');
    } catch {
      alert('Não foi possível copiar. Selecione e copie manualmente.');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <nav className="navbar bg-white shadow-sm px-4 py-3">
          <Link href="/landing" className="navbar-brand"><Logo /></Link>
        </nav>
        <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
          <div className="text-center">
            <div style={{ fontSize: '3rem' }}>🔍</div>
            <h2 className="h5 fw-bold mt-3 mb-2">Painel não encontrado</h2>
            <p className="text-muted small mb-4">
              {error || 'Link inválido ou expirado.'}
            </p>
            <Link href="/indicador/novo" className="btn btn-primary rounded-pill px-4">
              Cadastrar como afiliado
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Leads indicados', value: data.totalLeads, color: 'primary', type: 'count' },
    { label: 'Convertidos', value: data.totalConverted, color: 'success', type: 'count' },
    { label: 'A receber', value: data.pendingAmount, color: 'warning', type: 'currency' },
    { label: 'Recebido', value: data.paidAmount, color: 'secondary', type: 'currency' },
  ] as const;

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar bg-white shadow-sm px-4 py-3">
        <Link href="/landing" className="navbar-brand"><Logo /></Link>
      </nav>

      <div className="container py-4" style={{ maxWidth: 720 }}>
        <div className="mb-4">
          <h1 className="h5 fw-bold mb-0">Olá, {data.name}!</h1>
          <p className="text-muted small mb-0">Painel de indicações</p>
        </div>

        {/* Link card */}
        <div className="card border-primary mb-4 border-2">
          <div className="card-body d-flex align-items-start align-items-md-center gap-3 flex-column flex-md-row">
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <p className="small text-muted mb-1 fw-semibold">Seu link de indicação</p>
              <span className="small fw-semibold text-primary" style={{ wordBreak: 'break-all' }}>
                {data.link}
              </span>
            </div>
            <button
              className="btn btn-primary rounded-pill px-4 flex-shrink-0"
              onClick={copyLink}
            >
              Copiar
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="row g-3 mb-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className="card h-100 border-0 shadow-sm text-center p-3">
                <p className="small text-muted mb-1" style={{ fontSize: '0.75rem' }}>{kpi.label}</p>
                <p className={`h5 fw-bold text-${kpi.color} mb-0`}>
                  {kpi.type === 'currency' ? BRL.format(kpi.value as number) : kpi.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Leads table */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold py-3 border-bottom">
            Indicações
          </div>

          {data.leads.length === 0 ? (
            <div className="card-body text-center py-5">
              <div style={{ fontSize: '2rem' }}>📬</div>
              <p className="text-muted mt-3 mb-1 fw-semibold">Nenhuma indicação ainda</p>
              <p className="text-muted small mb-0">
                Compartilhe seu link para começar a acumular indicações.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3 py-2 small fw-semibold text-muted">E-mail</th>
                    <th className="py-2 small fw-semibold text-muted">Status</th>
                    <th className="pe-3 py-2 small fw-semibold text-muted text-end">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leads.map((lead, i) => (
                    <tr key={i}>
                      <td className="ps-3 small text-muted">{lead.maskedEmail}</td>
                      <td>
                        <span
                          className={`badge rounded-pill ${lead.status === 'CONVERTED' ? 'bg-success' : 'bg-secondary'}`}
                        >
                          {lead.status === 'CONVERTED' ? 'Convertido' : 'Lead'}
                        </span>
                      </td>
                      <td className="pe-3 small text-muted text-end">
                        {new Date(lead.date).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
