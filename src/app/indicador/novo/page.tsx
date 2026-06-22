"use client";

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { api } from '@/lib/apiClient';

interface AffiliateResponse {
  id: number;
  name: string;
  email: string;
  code: string;
  link: string;
  commissionRate: number;
}

export default function AffiliateRegistrationPage() {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AffiliateResponse | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<AffiliateResponse>('/affiliates', form);
      setResult(data);
    } catch {
      setError('E-mail já cadastrado ou ocorreu um erro. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!result?.link) return;
    try {
      await navigator.clipboard.writeText(result.link);
      alert('Link copiado!');
    } catch {
      alert('Não foi possível copiar. Selecione e copie manualmente.');
    }
  };

  const commissionPercent = result ? Math.round(result.commissionRate * 100) : 20;

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <nav className="navbar bg-white shadow-sm px-4 py-3">
        <Link href="/landing" className="navbar-brand">
          <Logo />
        </Link>
      </nav>

      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
        <div className="card shadow-sm border-0" style={{ maxWidth: 480, width: '100%', borderRadius: 16 }}>
          <div className="card-body p-4 p-md-5">
            {!result ? (
              <>
                <div className="text-center mb-4">
                  <div style={{ fontSize: '2.5rem' }}>🤝</div>
                  <h1 className="h4 fw-bold mb-1 mt-2">Programa de Indicação</h1>
                  <p className="text-muted small mb-0">
                    Indique clientes e ganhe{' '}
                    <strong className="text-primary">20% do primeiro pagamento</strong>{' '}
                    de cada conversão, via PIX.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 small" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Nome completo</label>
                    <input
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="João Silva"
                      required
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">E-mail</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="joao@email.com"
                      required
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold small">WhatsApp</label>
                    <input
                      name="whatsapp"
                      type="tel"
                      className="form-control"
                      placeholder="(31) 99999-9999"
                      required
                      value={form.whatsapp}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 rounded-pill fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Cadastrando...
                      </>
                    ) : (
                      'Gerar meu link de indicação'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div style={{ fontSize: '2.5rem' }}>🎉</div>
                  <h2 className="h4 fw-bold mt-2 mb-1">Cadastro realizado!</h2>
                  <p className="text-muted small">
                    Olá, <strong>{result.name}</strong>! Seu link de indicação está pronto.
                  </p>
                </div>

                <div
                  className="bg-light rounded-3 p-3 mb-3"
                  style={{ border: '1px solid #e0e0e0' }}
                >
                  <p className="small text-muted mb-1 fw-semibold">Seu link:</p>
                  <p
                    className="small fw-semibold mb-0 text-primary"
                    style={{ wordBreak: 'break-all' }}
                  >
                    {result.link}
                  </p>
                </div>

                <button
                  className="btn btn-primary w-100 rounded-pill fw-semibold mb-2"
                  onClick={copyLink}
                >
                  Copiar link
                </button>

                <Link
                  href={`/indicador/${result.code}`}
                  className="btn btn-outline-secondary w-100 rounded-pill"
                >
                  Ver meu painel de indicações
                </Link>

                <p className="text-center text-muted mt-4 mb-0" style={{ fontSize: '0.78rem' }}>
                  Compartilhe este link. Quando alguém assinar e pagar a primeira mensalidade,
                  você recebe <strong>{commissionPercent}% do valor via PIX</strong>.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
