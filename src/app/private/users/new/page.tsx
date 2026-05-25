"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import toast from "react-hot-toast";
import { roleLabelMap } from "@/lib/enums/labels";
import PageHeader from "@/components/admin/PageHeader";

type Role = "ADMIN" | "SYNDIC" | "TECH" | "READER";

const C = {
  navy: "#0f172a", blue: "#1d4ed8", blueSoft: "#eff6ff",
  border: "#e2e8f0", borderFocus: "#3b82f6",
  muted: "#64748b", error: "#dc2626", errorBg: "#fef2f2",
  surface: "#ffffff", bg: "#f8fafc",
};

const ROLE_META: Record<string, { icon: string; desc: string }> = {
  ADMIN:  { icon: "🔑", desc: "Acesso total ao sistema" },
  SYNDIC: { icon: "🏢", desc: "Gestão de condomínio" },
  TECH:   { icon: "🔧", desc: "Execução de manutenções" },
  READER: { icon: "👁️", desc: "Somente visualização" },
};

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "READER" as Role,
};

const LBL: React.CSSProperties = { fontSize:13, fontWeight:600, color:"#0f172a", display:"block", marginBottom:6 };

function inp(hasError: boolean): React.CSSProperties {
  return {
    width:"100%", padding:"10px 14px", borderRadius:8,
    border:`1.5px solid ${hasError ? C.error : C.border}`,
    fontSize:14, color:C.navy,
    backgroundColor: hasError ? C.errorBg : C.surface,
    outline:"none", boxSizing:"border-box",
  };
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ marginBottom:22 }}>
      <label style={LBL}>{label}</label>
      {children}
      {error && <div style={{ fontSize:12, color:C.error, marginTop:5 }}>{error}</div>}
    </div>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div style={{ borderLeft:`3px solid ${C.blue}`, paddingLeft:12, marginBottom:20, marginTop:4 }}>
      <span style={{ fontSize:12, fontWeight:700, color:C.blue, textTransform:"uppercase", letterSpacing:"0.06em" }}>
        {title}
      </span>
    </div>
  );
}

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);

  function touch(field: string) {
    setTouched(p => ({ ...p, [field]: true }));
  }

  function getError(field: string): string | undefined {
    if (!touched[field]) return undefined;
    const v = String(formData[field as keyof typeof formData] ?? "");
    if (!v.trim()) return "Campo obrigatório";
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "E-mail inválido";
    if (field === "password" && v.length < 8) return "Mínimo 8 caracteres";
    return undefined;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, role: true });

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    if (!formData.name.trim() || !emailOk || formData.password.length < 8) {
      toast.error("Preencha todos os campos corretamente.");
      return;
    }
    if (loading) return;

    try {
      setLoading(true);
      await api.post("/private/admin/users", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        status: "ACTIVE",
      });
      toast.success("Usuário criado com sucesso.");
      router.push("/private/users");
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Erro ao criar usuário. Tente novamente.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ backgroundColor:C.bg, minHeight:"100vh", padding:16 }}>
      <style>{`
        @keyframes usrnew-spin { to { transform: rotate(360deg); } }
        .usrnew-spin { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:usrnew-spin 0.8s linear infinite; }
        .role-card { cursor:pointer; transition:border-color 0.15s, background 0.15s; }
        .role-card:hover { border-color: #93c5fd !important; background: #f0f9ff !important; }
      `}</style>

      <PageHeader
        title="Criar Novo Usuário"
        description="Cadastre um novo usuário no sistema."
        backUrl="/private/users"
      />

      <div style={{ maxWidth:680, margin:"0 auto", background:C.surface, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <form onSubmit={onSubmit} noValidate>
          <div style={{ padding:"28px 28px 8px" }}>
            <Section title="Dados do Usuário" />

            <Field label="Nome Completo *" error={getError("name")}>
              <input
                style={inp(!!getError("name"))}
                placeholder="Ex: João Silva"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                onBlur={() => touch("name")}
              />
            </Field>

            <Field label="E-mail *" error={getError("email")}>
              <input
                type="email"
                style={inp(!!getError("email"))}
                placeholder="joao@exemplo.com"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                onBlur={() => touch("email")}
              />
            </Field>

            <Field label="Senha *" error={getError("password")}>
              <div style={{ position:"relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  style={{ ...inp(!!getError("password")), paddingRight:44 }}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  onBlur={() => touch("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:18, padding:0, lineHeight:1 }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </Field>

            <Section title="Perfil de Acesso" />

            <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:28 }}>
              {Object.entries(roleLabelMap).map(([value, label]) => {
                const meta = ROLE_META[value] ?? { icon: "👤", desc: "" };
                const selected = formData.role === value;
                return (
                  <div
                    key={value}
                    className="role-card"
                    onClick={() => { setFormData(p => ({ ...p, role: value as Role })); touch("role"); }}
                    style={{
                      padding:"16px 10px", borderRadius:10,
                      border:`2px solid ${selected ? C.blue : C.border}`,
                      backgroundColor: selected ? C.blueSoft : C.surface,
                      textAlign:"center", flex:"1 1 110px", minWidth:110,
                    }}
                  >
                    <div style={{ fontSize:26, marginBottom:6 }}>{meta.icon}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:selected ? C.blue : C.navy }}>{String(label)}</div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{meta.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding:"18px 28px", borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"flex-end", gap:12, backgroundColor:"#fafafa" }}>
            <a
              href="/private/users"
              style={{ display:"inline-flex", alignItems:"center", padding:"10px 20px", borderRadius:8, border:`1px solid ${C.border}`, color:C.muted, fontSize:13, fontWeight:600, textDecoration:"none" }}
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={loading}
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 24px", borderRadius:8, backgroundColor:C.blue, color:"#fff", fontSize:13, fontWeight:600, border:"none", cursor:loading ? "not-allowed" : "pointer", opacity:loading ? 0.8 : 1 }}
            >
              {loading && <span className="usrnew-spin" />}
              {loading ? "Criando..." : "Criar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
