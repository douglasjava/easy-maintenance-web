"use client";

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { api } from '@/lib/apiClient';
import toast from 'react-hot-toast';

interface AffiliateResponse {
  id: number;
  name: string;
  email: string;
  code: string;
  link: string;
  commissionRate: number;
}

const TERMS = [
  'A comissão é paga somente após a confirmação do primeiro pagamento do cliente indicado.',
  'Válido exclusivamente para clientes novos que ainda não possuem cadastro no Easy Maintenance.',
  'Indicações de contas próprias ou de pessoas já cadastradas não são elegíveis.',
  'O Easy Maintenance reserva o direito de cancelar afiliados que utilizem práticas enganosas, spam ou qualquer forma de divulgação indevida.',
  'O pagamento é realizado manualmente via PIX em até 10 dias úteis após a confirmação da conversão.',
  'Os valores e percentuais de comissão podem ser alterados a qualquer momento para novos indicados.',
];

export default function AffiliateRegistrationPage() {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '' });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AffiliateResponse | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = (): string => {
    if (!form.name.trim()) return 'Informe seu nome completo.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Informe um e-mail válido.';
    if (!form.whatsapp.trim()) return 'Informe seu WhatsApp.';
    if (!accepted) return 'Você precisa aceitar os termos para continuar.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post<AffiliateResponse>('/affiliates', form);
      setResult(data);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(detail || 'Ocorreu um erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!result?.link) return;
    try {
      await navigator.clipboard.writeText(result.link);
      toast.success('Link copiado!');
    } catch {
      toast.error('Não foi possível copiar. Selecione e copie manualmente.');
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

      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3 py-4">
        <div style={{ maxWidth: 520, width: '100%' }}>

          {!result ? (
            <>
              {/* ── Como funciona ── */}
              <div className="card shadow-sm border-0 mb-3" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                  <div className="text-center mb-3">
                    <div style={{ fontSize: '2rem' }}>🤝</div>
                    <h1 className="h5 fw-bold mb-1 mt-2">Programa de Indicação</h1>
                    <p className="text-muted small mb-0">
                      Indique clientes e ganhe{' '}
                      <strong className="text-primary">20% do primeiro pagamento</strong>{' '}
                      de cada conversão, via PIX.
                    </p>
                  </div>

                  <div className="row g-2 text-center mt-2">
                    {[
                      { icon: '📝', step: '1', label: 'Cadastre-se', desc: 'Preencha o formulário e receba seu link único' },
                      { icon: '🔗', step: '2', label: 'Compartilhe', desc: 'Envie o link para potenciais clientes' },
                      { icon: '💸', step: '3', label: 'Receba', desc: '20% do primeiro pagamento via PIX' },
                    ].map(s => (
                      <div key={s.step} className="col-4">
                        <div className="bg-light rounded-3 p-2 h-100">
                          <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
                          <div className="fw-bold small text-primary mt-1">{s.label}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem', lineHeight: 1.3 }}>{s.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Formulário ── */}
              <div className="card shadow-sm border-0" style={{ borderRadius: 16 }}>
                <div className="card-body p-4">
                  {error && (
                    <div className="alert alert-danger py-2 small mb-3" role="alert">
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
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">WhatsApp</label>
                      <input
                        name="whatsapp"
                        type="tel"
                        className="form-control"
                        placeholder="(31) 99999-9999"
                        value={form.whatsapp}
                        onChange={handleChange}
                      />
                    </div>

                    {/* ── Termos ── */}
                    <div
                      className="rounded-3 p-3 mb-3"
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                    >
                      <p className="fw-semibold small mb-2" style={{ color: '#0f172a' }}>
                        Termos do Programa de Indicação
                      </p>
                      <ul className="mb-2 ps-3" style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                        {TERMS.map((t, i) => (
                          <li key={i} className="mb-1">{t}</li>
                        ))}
                      </ul>
                      <div className="form-check mb-0 mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="acceptTerms"
                          checked={accepted}
                          onChange={e => setAccepted(e.target.checked)}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="acceptTerms" style={{ fontSize: '0.8rem' }}>
                          Li e aceito os termos do programa de indicação
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 rounded-pill fw-semibold"
                      disabled={loading || !accepted}
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
                </div>
              </div>
            </>
          ) : (
            <div className="card shadow-sm border-0" style={{ borderRadius: 16 }}>
              <div className="card-body p-4 p-md-5">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
