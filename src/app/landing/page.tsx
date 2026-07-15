"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { api } from '@/lib/apiClient';
import Cookies from 'js-cookie';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Easy Maintenance",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "url": "https://easymaintenance.com.br",
  "description": "Software de gestão de manutenção preventiva para condomínios, hospitais, escolas e indústrias. Conformidade com ABNT NBR 5674, NBR 14037 e NBR 16280.",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock"
  },
  "inLanguage": "pt-BR"
};

const WHATSAPP_NUMBER = "5531999826634";
const WHATSAPP_MESSAGE =
  "Olá, tudo bem? Vi a Easy Maintenance no site e quero entender como ela pode ajudar na gestão de manutenção do meu condomínio/empresa.";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      Cookies.set('em_ref', ref, { expires: 30, sameSite: 'Lax' });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const affiliateCode = Cookies.get('em_ref') || undefined;
      await api.post('/landing/leads', { email, affiliateCode });
      alert(`Obrigado! Entraremos em contato através do e-mail: ${email}`);
      setEmail('');
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
      alert('Ocorreu um erro ao enviar seu e-mail. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="landing-page bg-light min-vh-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <style jsx>{`
          .section-title {
              margin-bottom: 80px;
          }
        .hero-section {
          padding: 140px 2rem 180px 2rem;   /* mais espaço embaixo para separar da próxima seção */
          background: linear-gradient(135deg, #0b1220 0%, #1e293b 100%);
          color: white;
        }
        .section-padding {
            padding: 160px 2rem;
        }

        @media (max-width: 768px) {
            .section-padding {
                padding: 110px 1.2rem;    /* mobile um pouco menor */
            }
        }
        .card {
          border: none;
          transition: transform 0.3s ease;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .card:hover {
          transform: translateY(-5px);
        }
        .feature-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background-color: #2563eb;
          color: white;
          margin-bottom: 20px;
        }
        .problem-card {
          border-left: 4px solid #ef4444;
        }
        .solution-card {
          border-left: 4px solid #10b981;
        }
        .nav-link:hover {
          color: #2563eb !important;
        }
        .whatsapp-float {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background-color: #25d366;
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          z-index: 1000;
          font-size: 30px;
        }
      `}</style>

      {/* WhatsApp flutuante */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Falar no WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
        </svg>
      </a>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
        <div className="container">
          <Link href="/landing" className="navbar-brand">
            <Logo />
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item"><a className="nav-link px-3" href="#problema">Problema</a></li>
              <li className="nav-item"><a className="nav-link px-3" href="#solucao">Solução</a></li>
              <li className="nav-item"><a className="nav-link px-3" href="#diferenciais">Diferenciais</a></li>
              <li className="nav-item"><a className="nav-link px-3" href="#para-quem">Para quem</a></li>
              <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                <Link href="/login" className="btn btn-outline-primary rounded-pill px-4">Login Cliente</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">Gestão de Manutenção Preventiva Inteligente</h1>
              <p className="lead mb-5 opacity-75">Elimine o caos das planilhas e mensagens de WhatsApp. Tenha total controle sobre seus ativos, vencimentos e conformidade legal em uma única plataforma.</p>
              
              <form onSubmit={handleSubmit} className="row g-2">
                <div className="col-md-7">
                  <input 
                    type="email" 
                    className="form-control form-control-lg rounded-pill" 
                    placeholder="Seu melhor e-mail" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 rounded-pill"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Solicitar Demonstração'}
                  </button>
                </div>
              </form>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div className="bg-white rounded-3 shadow p-2" style={{ transform: 'perspective(1000px) rotateY(-10deg)' }}>
                <Image
                  src="/dashboard_preview.png"
                  alt="Tela do dashboard Easy Maintenance com visão geral de manutenções preventivas, prazos e conformidade"
                  width={900}
                  height={600}
                  className="img-fluid rounded shadow-sm"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Problemas */}
      <section id="problema" className="section-padding bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mt-3">Por que as empresas perdem o controle?</h2>
          </div>
          <div className="row g-5">
            {[
              { title: "Planilhas espalhadas", desc: "Informações fragmentadas que dificultam a visão geral." },
              { title: "Ordens no WhatsApp", desc: "Solicitações que se perdem no histórico de conversas." },
              { title: "Troca de síndico = perda de histórico", desc: "A memória técnica da edificação desaparece na rotatividade." },
              { title: "Medo de multa e processo", desc: "Insegurança jurídica por falta de comprovação de manutenção." },
              { title: "Não sabe o que vence quando", desc: "Falta de previsibilidade sobre renovações e manutenções críticas." }
            ].map((item, index) => (
              <div key={index} className="col-md-4">
                <div className="card h-100 p-4 problem-card">
                  <h4 className="h5 fw-bold">{item.title}</h4>
                  <p className="text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solução */}
      <section id="solucao" className="section-padding">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mt-4">Tudo o que você precisa em um só lugar</h2>
          </div>
          <div className="row g-5">
            {[
              { title: "Central de ativos", icon: "📋", desc: "Inventário completo de equipamentos e sistemas." },
              { title: "Agenda de vencimentos", icon: "📅", desc: "Calendário inteligente para nunca perder um prazo." },
              { title: "Repositório de laudos", icon: "📄", desc: "Documentação técnica organizada e acessível." },
              { title: "Trilha de auditoria", icon: "🔍", desc: "Histórico completo de quem fez o que e quando." },
              { title: "Evidências fotográficas", icon: "📸", desc: "Comprovação visual da execução dos serviços." },
              { title: "Gestão de fornecedores", icon: "🤝", desc: "Controle de prestadores e qualidade de entrega." }
            ].map((item, index) => (
              <div key={index} className="col-md-4">
                <div className="card h-100 p-4 solution-card">
                  <div className="feature-icon fs-4">{item.icon}</div>
                  <h4 className="h5 fw-bold">{item.title}</h4>
                  <p className="text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section id="diferenciais" className="section-padding bg-dark text-white mt-3">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-5 mb-lg-0">
              <span className="text-primary fw-bold text-uppercase">Diferenciais</span>
              <h2 className="display-6 fw-bold mb-4">Por que o Easy Maintenance é diferente?</h2>
              <p className="opacity-75 mb-4">Nossa plataforma foi construída ouvindo as dores reais do mercado brasileiro.</p>
              <button className="btn btn-primary rounded-pill px-4">Ver todos os recursos</button>
            </div>
            <div className="col-lg-7 mb-3 mt-3">
              <div className="row g-3">
                {[
                  { title: "Foco em legislação brasileira", desc: "Adequado às normas técnicas nacionais (ABNT)." },
                  { title: "Modelo por organização", desc: "Estrutura hierárquica clara para multiclientes ou filiais." },
                  { title: "Histórico técnico", desc: "Acervo digital permanente da vida útil dos ativos." },
                  { title: "Evidência vinculada", desc: "Cada manutenção possui sua prova de execução direta." },
                  { title: "Visão para auditoria", desc: "Relatórios prontos para processos de certificação." }
                ].map((item, index) => (
                  <div key={index} className="col-md-6">
                    <div className="p-3 bg-secondary bg-opacity-10 rounded border border-secondary border-opacity-25">
                      <h5 className="h6 fw-bold text-primary">{item.title}</h5>
                      <p className="small mb-0 opacity-75">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section id="para-quem" className="section-padding bg-white">
        <div className="container">
          <div className="text-center">
            <h2 className="display-6 fw-bold">Feito para quem exige eficiência</h2>
          </div>
          
          <div className="row mb-5">
            <div className="col-12">
              <h4 className="mb-4 text-center">Segmentos Principais</h4>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                {["Condomínios", "Hospitais", "Escolas", "Indústrias", "Escritórios"].map((seg, i) => (
                  <div key={i} className="px-4 py-2 bg-light rounded-pill border fw-bold">{seg}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="row g-5 mb-4">
            <div className="col-lg-12">
              <h4 className="mb-4 text-center">Quem utiliza nossa plataforma</h4>
            </div>
            {[
              { title: "Administradoras", desc: "Gestão centralizada de múltiplos clientes." },
              { title: "Síndicos", desc: "Segurança e transparência na gestão predial." },
              { title: "Empresas", desc: "Manutenção de ativos operacionais críticos." },
              { title: "Gestores de facilities", desc: "Otimização de custos e produtividade." }
            ].map((item, index) => (
              <div key={index} className="col-md-3">
                <div className="card h-100 p-4 text-center border-top border-primary border-4">
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="small text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section-padding bg-primary text-white text-center pb-3">
        <div className="container">
          <h2 className="display-5 fw-bold mb-4">Pronto para profissionalizar sua manutenção?</h2>
          <p className="lead mb-5 opacity-75">Junte-se a centenas de gestores que já transformaram suas operações.</p>
          <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-5">
            <button 
              className="btn btn-light btn-lg rounded-pill px-5" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              disabled={loading}
            >
              Solicitar Demonstração
            </button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-lg rounded-pill px-5">Falar com Consultor</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 bg-light border-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4 mb-lg-0">
              <Logo />
              <p className="mt-3 text-muted">A solução definitiva para gestão de ativos e manutenção preventiva no Brasil.</p>
            </div>
            <div className="col-md-4 col-lg-2 mb-4 mb-lg-0">
              <h6 className="fw-bold">Navegação</h6>
              <ul className="list-unstyled">
                <li><a href="#problema" className="text-muted text-decoration-none">Problema</a></li>
                <li><a href="#solucao" className="text-muted text-decoration-none">Solução</a></li>
                <li><a href="#diferenciais" className="text-muted text-decoration-none">Diferenciais</a></li>
              </ul>
            </div>
            <div className="col-md-4 col-lg-2 mb-4 mb-lg-0">
              <h6 className="fw-bold">Acesso</h6>
              <ul className="list-unstyled">
                <li><Link href="/login" className="text-muted text-decoration-none">Login Cliente</Link></li>
                <li><a href="#" className="text-muted text-decoration-none">Termos de Uso</a></li>
              </ul>
            </div>
            <div className="col-md-4 col-lg-4">
              <h6 className="fw-bold">Contato</h6>
              <p className="text-muted mb-1">comercial@easymaintenance.com.br</p>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted text-decoration-none d-block"
              >
                WhatsApp: (31) 9 9982-6634
              </a>
            </div>
          </div>
          <hr className="my-4" />
          <div className="text-center text-muted small">
            &copy; {currentYear} Easy Maintenance. Todos os direitos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
}
