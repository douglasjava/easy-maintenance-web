"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminOrganizationsService } from "@/services/private/admin-organizations.service";
import { adminUsersService } from "@/services/private/admin-users.service";
import { adminBillingService } from "@/services/private/admin-billing.service";
import toast from "react-hot-toast";
import AsyncSelect from "react-select/async";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

type Plan = "STARTER" | "BUSINESS" | "ENTERPRISE";

// ── Design tokens ──────────────────────────────────────────────────────────

const C = {
  navy:    "#0B2545",
  blue:    "#1d4ed8",
  blueSoft:"#eff6ff",
  border:  "#e2e8f0",
  borderFocus: "#93c5fd",
  muted:   "#64748b",
  error:   "#dc2626",
  errorBg: "#fef2f2",
  surface: "#ffffff",
  bg:      "#f1f5f9",
  success: "#16a34a",
  successBg: "#f0fdf4",
};

const LABEL: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: C.muted,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: 5,
  display: "block",
};

const INPUT: React.CSSProperties = {
  width: "100%",
  border: `1px solid ${C.border}`,
  borderRadius: 7,
  padding: "9px 12px",
  fontSize: "0.875rem",
  color: C.navy,
  backgroundColor: C.surface,
  outline: "none",
  transition: "border-color 0.15s",
};

const INPUT_ERR: React.CSSProperties = {
  ...INPUT,
  border: `1px solid ${C.error}`,
  backgroundColor: C.errorBg,
};

// ── Masks ──────────────────────────────────────────────────────────────────

function maskDoc(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskCep(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return d.replace(/(\d{5})(\d)/, "$1-$2");
}

// ── Company type cards ────────────────────────────────────────────────────

const COMPANY_TYPES = [
  { value: "CONDOMINIUM", label: "Condomínio",  icon: "🏢" },
  { value: "HOSPITAL",    label: "Hospital",     icon: "🏥" },
  { value: "SCHOOL",      label: "Escola",       icon: "🏫" },
  { value: "INDUSTRY",    label: "Indústria",    icon: "🏭" },
  { value: "OFFICE",      label: "Escritório",   icon: "🏬" },
  { value: "OTHER",       label: "Outro",        icon: "📋" },
];

// ── Plan cards ────────────────────────────────────────────────────────────

const PLANS: { value: Plan; label: string; desc: string }[] = [
  { value: "STARTER",    label: "Starter",    desc: "1 empresa" },
  { value: "BUSINESS",   label: "Business",   desc: "5 empresas" },
  { value: "ENTERPRISE", label: "Enterprise", desc: "15 empresas" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE",   label: "Ativo" },
  { value: "TRIALING", label: "Trial" },
  { value: "PAST_DUE", label: "Em atraso" },
  { value: "CANCELED", label: "Cancelado" },
];

// ── Field wrapper ─────────────────────────────────────────────────────────

function Field({ label, error, children, required }: {
  label: string; error?: string; children: React.ReactNode; required?: boolean;
}) {
  return (
    <div>
      <label style={LABEL}>
        {label}{required && <span style={{ color: C.error }}> *</span>}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: "0.72rem", color: C.error, margin: "4px 0 0" }}>{error}</p>
      )}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────

function Section({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ borderLeft: `3px solid ${C.blue}`, paddingLeft: 12, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: C.navy }}>{title}</div>
      {subtitle && <div style={{ fontSize: "0.75rem", color: C.muted, marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Dados da empresa" },
    { n: 2, label: "Assinatura" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "0.85rem",
              backgroundColor: step > s.n ? C.success : step === s.n ? C.blue : C.border,
              color: step >= s.n ? "#fff" : C.muted,
              flexShrink: 0,
              transition: "background-color 0.2s",
            }}>
              {step > s.n ? "✓" : s.n}
            </div>
            <span style={{
              fontSize: "0.68rem", fontWeight: 600,
              color: step >= s.n ? C.navy : C.muted,
              whiteSpace: "nowrap",
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: "0 8px", marginBottom: 22,
              backgroundColor: step > s.n ? C.success : C.border,
              transition: "background-color 0.2s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "", companyType: "OTHER", doc: "", docMasked: "",
  zipCode: "", zipMasked: "", street: "", number: "",
  complement: "", neighborhood: "", city: "", state: "", country: "BR",
};

const EMPTY_SUB = {
  payerUserId: "", planCode: "STARTER" as Plan,
  status: "ACTIVE", currentPeriodStart: "", currentPeriodEnd: "",
};

export default function CreateOrganizationPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sub, setSub] = useState(EMPTY_SUB);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [createdOrgCode, setCreatedOrgCode] = useState("");
  const router = useRouter();

  function touch(field: string) {
    setTouched(p => ({ ...p, [field]: true }));
  }

  function getError(field: string): string | undefined {
    if (!touched[field]) return undefined;
    if (field === "name" && !form.name.trim()) return "Nome é obrigatório";
    if (field === "doc") {
      const d = form.doc;
      if (d && d.length !== 11 && d.length !== 14) return "Documento incompleto";
    }
    return undefined;
  }

  async function handleZipBlur() {
    touch("zipCode");
    const raw = form.zipCode;
    if (raw.length !== 8) return;
    setZipLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(p => ({
          ...p,
          street:       data.logradouro || p.street,
          neighborhood: data.bairro     || p.neighborhood,
          city:         data.localidade || p.city,
          state:        data.uf         || p.state,
          zipMasked:    maskCep(raw),
        }));
        toast.success("Endereço preenchido pelo CEP");
      } else {
        toast.error("CEP não encontrado");
      }
    } catch {
      /* silently ignore */
    } finally {
      setZipLoading(false);
    }
  }

  async function loadPayerOptions(inputValue: string) {
    if (!inputValue || inputValue.length < 2) return [];
    try {
      const data = await adminUsersService.list({ page: 0, size: 20 });
      return (data.content || [])
        .filter(u =>
          u.name.toLowerCase().includes(inputValue.toLowerCase()) ||
          u.email.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((u: any) => ({ value: String(u.id), label: `${u.name} (${u.email})` }));
    } catch {
      return [];
    }
  }

  async function onSubmitStep1(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, doc: true, zipCode: true });
    if (!form.name.trim()) return;
    if (loading) return;

    const orgCode = crypto.randomUUID();
    const payload = {
      code: orgCode,
      name: form.name.trim(),
      companyType: form.companyType,
      doc: form.doc || undefined,
      zipCode: form.zipCode || undefined,
      street: form.street.trim() || undefined,
      number: form.number.trim() || undefined,
      complement: form.complement.trim() || undefined,
      neighborhood: form.neighborhood.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state.trim() || undefined,
      country: form.country.trim() || "BR",
    };

    try {
      setLoading(true);
      await adminOrganizationsService.create(payload);
      toast.success("Empresa criada. Configure a assinatura.");
      setCreatedOrgCode(orgCode);
      setStep(2);
    } catch {
      toast.error("Falha ao criar empresa.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!sub.payerUserId || !sub.planCode) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    if (loading) return;

    const toTs = (d: string) => d ? Math.floor(new Date(d).getTime() / 1000) : undefined;
    const payload = {
      payerUserId: Number(sub.payerUserId),
      planCode: sub.planCode,
      status: sub.status,
      currentPeriodStart: toTs(sub.currentPeriodStart),
      currentPeriodEnd: toTs(sub.currentPeriodEnd),
    };

    try {
      setLoading(true);
      await adminBillingService.updateUserSubscription(createdOrgCode, payload);
      toast.success("Assinatura configurada com sucesso.");
      router.push("/private/organizations");
    } catch {
      toast.error("Falha ao configurar assinatura.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ backgroundColor: C.bg, minHeight: "100vh", padding: "16px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link
          href="/private/organizations"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: "0.78rem", color: C.muted, textDecoration: "none",
            border: `1px solid ${C.border}`, borderRadius: 6,
            padding: "5px 10px", backgroundColor: C.surface,
          }}
        >
          ← Voltar
        </Link>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: C.navy, margin: 0 }}>
            Nova Empresa
          </h1>
          <p style={{ fontSize: "0.75rem", color: C.muted, margin: 0 }}>
            Preencha os dados e configure a assinatura
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Card */}
        <div style={{
          backgroundColor: C.surface,
          borderRadius: 12,
          border: `1px solid ${C.border}`,
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          padding: "28px 24px",
        }}>
          <StepBar step={step} />

          {/* ── STEP 1 ─────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={onSubmitStep1} noValidate>

              {/* Identificação */}
              <Section title="Identificação" subtitle="Nome e tipo da empresa" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 28 }}>
                <Field label="Nome da empresa" required error={getError("name")}>
                  <input
                    style={getError("name") ? INPUT_ERR : INPUT}
                    placeholder="Ex: Condomínio Parque das Flores"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    onBlur={() => touch("name")}
                    required
                  />
                </Field>

                <Field label="CNPJ / CPF" error={getError("doc")}>
                  <input
                    style={getError("doc") ? INPUT_ERR : INPUT}
                    placeholder="00.000.000/0000-00"
                    value={form.docMasked}
                    inputMode="numeric"
                    onChange={e => {
                      const masked = maskDoc(e.target.value);
                      const raw = masked.replace(/\D/g, "");
                      setForm(p => ({ ...p, doc: raw, docMasked: masked }));
                    }}
                    onBlur={() => touch("doc")}
                  />
                </Field>
              </div>

              {/* Tipo de empresa */}
              <div style={{ marginBottom: 28 }}>
                <label style={LABEL}>Tipo de empresa <span style={{ color: C.error }}>*</span></label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}>
                  {COMPANY_TYPES.map(ct => {
                    const selected = form.companyType === ct.value;
                    return (
                      <button
                        key={ct.value}
                        type="button"
                        onClick={() => setForm(p => ({ ...p, companyType: ct.value }))}
                        style={{
                          display: "flex", flexDirection: "column",
                          alignItems: "center", gap: 4,
                          padding: "12px 8px",
                          borderRadius: 8,
                          border: selected ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                          backgroundColor: selected ? C.blueSoft : C.surface,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{ct.icon}</span>
                        <span style={{
                          fontSize: "0.7rem", fontWeight: selected ? 700 : 500,
                          color: selected ? C.blue : C.muted,
                        }}>
                          {ct.label}
                        </span>
                        {selected && (
                          <span style={{
                            fontSize: "0.6rem", backgroundColor: C.blue,
                            color: "#fff", borderRadius: 10, padding: "1px 6px", fontWeight: 700,
                          }}>✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Endereço */}
              <Section title="Endereço" subtitle="Localização da empresa (opcional)" />
              <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>

                {/* CEP + Número */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="CEP">
                    <div style={{ position: "relative" }}>
                      <input
                        style={INPUT}
                        placeholder="00000-000"
                        value={form.zipMasked}
                        inputMode="numeric"
                        onChange={e => {
                          const masked = maskCep(e.target.value);
                          const raw = masked.replace(/\D/g, "");
                          setForm(p => ({ ...p, zipCode: raw, zipMasked: masked }));
                        }}
                        onBlur={handleZipBlur}
                      />
                      {zipLoading && (
                        <div style={{
                          position: "absolute", right: 10, top: "50%",
                          transform: "translateY(-50%)",
                          width: 14, height: 14,
                          border: "2px solid #e2e8f0",
                          borderTop: `2px solid ${C.blue}`,
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }} />
                      )}
                    </div>
                  </Field>
                  <Field label="Número">
                    <input
                      style={INPUT}
                      placeholder="123"
                      value={form.number}
                      onChange={e => setForm(p => ({ ...p, number: e.target.value }))}
                    />
                  </Field>
                </div>

                {/* Logradouro */}
                <Field label="Logradouro">
                  <input
                    style={INPUT}
                    placeholder="Rua, Avenida..."
                    value={form.street}
                    onChange={e => setForm(p => ({ ...p, street: e.target.value }))}
                  />
                </Field>

                {/* Bairro + Complemento */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Bairro">
                    <input
                      style={INPUT}
                      placeholder="Bairro"
                      value={form.neighborhood}
                      onChange={e => setForm(p => ({ ...p, neighborhood: e.target.value }))}
                    />
                  </Field>
                  <Field label="Complemento">
                    <input
                      style={INPUT}
                      placeholder="Apto, Sala..."
                      value={form.complement}
                      onChange={e => setForm(p => ({ ...p, complement: e.target.value }))}
                    />
                  </Field>
                </div>

                {/* Cidade + UF + País */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
                  <Field label="Cidade">
                    <input
                      style={INPUT}
                      placeholder="Cidade"
                      value={form.city}
                      onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                    />
                  </Field>
                  <Field label="UF">
                    <input
                      style={INPUT}
                      placeholder="SP"
                      maxLength={2}
                      value={form.state}
                      onChange={e => setForm(p => ({ ...p, state: e.target.value.toUpperCase() }))}
                    />
                  </Field>
                  <Field label="País">
                    <input
                      style={INPUT}
                      value={form.country}
                      onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                    />
                  </Field>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                borderTop: `1px solid ${C.border}`, paddingTop: 20,
                display: "flex", justifyContent: "flex-end",
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 28px", borderRadius: 8,
                    backgroundColor: loading ? "#93c5fd" : C.blue,
                    color: "#fff", border: "none",
                    fontWeight: 700, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 14, height: 14,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }} />
                      Criando...
                    </>
                  ) : "Próximo: Assinatura →"}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2 ─────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={onSubmitStep2} noValidate>
              <Section title="Responsável financeiro" subtitle="Usuário que será o pagador da assinatura" />

              <div style={{ marginBottom: 20 }}>
                <label style={LABEL}>Usuário responsável <span style={{ color: C.error }}>*</span></label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={loadPayerOptions}
                  defaultOptions
                  placeholder="Digite nome ou e-mail..."
                  noOptionsMessage={() => "Nenhum usuário encontrado"}
                  loadingMessage={() => "Buscando..."}
                  onChange={(opt: any) => setSub(p => ({ ...p, payerUserId: opt ? opt.value : "" }))}
                  isClearable
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderRadius: 7,
                      borderColor: state.isFocused ? C.borderFocus : C.border,
                      boxShadow: state.isFocused ? `0 0 0 3px ${C.blueSoft}` : "none",
                      fontSize: "0.875rem",
                      minHeight: 40,
                    }),
                    option: (base, state) => ({
                      ...base,
                      fontSize: "0.875rem",
                      backgroundColor: state.isSelected ? C.blue : state.isFocused ? C.blueSoft : "#fff",
                      color: state.isSelected ? "#fff" : C.navy,
                    }),
                  }}
                />
                <p style={{ fontSize: "0.72rem", color: C.muted, marginTop: 5 }}>
                  Este usuário será o responsável financeiro.
                </p>
              </div>

              <Section title="Plano e período" subtitle="Configuração da assinatura inicial" />

              {/* Plan cards */}
              <div style={{ marginBottom: 20 }}>
                <label style={LABEL}>Plano <span style={{ color: C.error }}>*</span></label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {PLANS.map(pl => {
                    const sel = sub.planCode === pl.value;
                    return (
                      <button
                        key={pl.value}
                        type="button"
                        onClick={() => setSub(p => ({ ...p, planCode: pl.value }))}
                        style={{
                          padding: "12px 8px", borderRadius: 8,
                          border: sel ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                          backgroundColor: sel ? C.blueSoft : C.surface,
                          cursor: "pointer", textAlign: "center",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "0.8rem", color: sel ? C.blue : C.navy }}>
                          {pl.label}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: C.muted }}>{pl.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div style={{ marginBottom: 20 }}>
                <label style={LABEL}>Status inicial <span style={{ color: C.error }}>*</span></label>
                <select
                  value={sub.status}
                  onChange={e => setSub(p => ({ ...p, status: e.target.value }))}
                  style={{ ...INPUT, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32 }}
                >
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                <Field label="Início do período">
                  <input
                    type="date"
                    style={INPUT}
                    value={sub.currentPeriodStart}
                    onChange={e => setSub(p => ({ ...p, currentPeriodStart: e.target.value }))}
                  />
                </Field>
                <Field label="Fim do período">
                  <input
                    type="date"
                    style={INPUT}
                    value={sub.currentPeriodEnd}
                    onChange={e => setSub(p => ({ ...p, currentPeriodEnd: e.target.value }))}
                  />
                </Field>
              </div>

              {/* Footer */}
              <div style={{
                borderTop: `1px solid ${C.border}`, paddingTop: 20,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  style={{
                    padding: "9px 20px", borderRadius: 8,
                    border: `1px solid ${C.border}`, backgroundColor: C.surface,
                    color: C.muted, fontWeight: 600, fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 28px", borderRadius: 8,
                    backgroundColor: loading ? "#86efac" : C.success,
                    color: "#fff", border: "none",
                    fontWeight: 700, fontSize: "0.875rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 14, height: 14,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.7s linear infinite",
                      }} />
                      Finalizando...
                    </>
                  ) : "✓ Concluir e criar empresa"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { outline: none; border-color: ${C.borderFocus} !important; box-shadow: 0 0 0 3px ${C.blueSoft}; }
        @media (max-width: 480px) {
          .type-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .plan-grid { grid-template-columns: 1fr !important; }
          .two-col { grid-template-columns: 1fr !important; }
          .three-col { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
}
