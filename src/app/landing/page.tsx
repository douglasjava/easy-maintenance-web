"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de captura de lead
    alert(`Obrigado! Entraremos em contato através do e-mail: ${email}`);
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="landing-page bg-light min-vh-100">
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
                  <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill">Solicitar Demonstração</button>
                </div>
              </form>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div className="bg-white rounded-3 shadow p-2" style={{ transform: 'perspective(1000px) rotateY(-10deg)' }}>
                <div className="bg-light rounded p-4 border border-2">
                  <div className="d-flex justify-content-between mb-4">
                    <div className="h-25 bg-secondary opacity-25 rounded" style={{width: '120px', height: '20px'}}></div>
                    <div className="h-25 bg-primary opacity-25 rounded" style={{width: '60px', height: '20px'}}></div>
                  </div>
                  <div className="row g-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="col-6">
                        <div className="p-3 border rounded">
                          <div className="bg-light mb-2" style={{height: '10px', width: '60%'}}></div>
                          <div className="bg-primary" style={{height: '15px', width: '90%'}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-light rounded border-dashed border-2 text-center text-muted">
                    Dashboard Preview
                  </div>
                </div>
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
            <button className="btn btn-light btn-lg rounded-pill px-5" onClick={() => window.scrollTo(0, 0)}>Solicitar Demonstração</button>
            <a href="https://wa.me/5531995639390" target="_blank" className="btn btn-outline-light btn-lg rounded-pill px-5">Falar com Consultor</a>
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
              <p className="text-muted">WhatsApp: (31) 99563-9390</p>
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
