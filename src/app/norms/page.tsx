"use client";

import { Info, BookOpen, ShieldCheck } from "lucide-react";

const NORMS = [
  {
    code: "NR 10",
    name: "Segurança em Instalações e Serviços em Eletricidade",
    description: "Esta norma estabelece os requisitos e condições mínimas objetivando a implementação de medidas de controle e sistemas preventivos, de forma a garantir a segurança e a saúde dos trabalhadores que, direta ou indiretamente, interajam em instalações elétricas e serviços com eletricidade.",
    importance: "Fundamental para evitar acidentes com choques elétricos, curtos-circuitos e incêndios em prédios e hospitais, onde a continuidade da energia é vital."
  },
  {
    code: "NR 13",
    name: "Caldeiras, Vasos de Pressão, Tubulações e Tanques Metálicos de Armazenamento",
    description: "Estabelece requisitos mínimos para a gestão da integridade estrutural de caldeiras a vapor, vasos de pressão, suas tubulações de interligação e tanques metálicos de armazenamento nos aspectos relacionados à instalação, inspeção, operação e manutenção.",
    importance: "Essencial para garantir que equipamentos sob pressão não explodam, protegendo a integridade física de ocupantes e a estrutura da edificação."
  },
  {
    code: "NR 35",
    name: "Trabalho em Altura",
    description: "Estabelece os requisitos mínimos e as medidas de proteção para o trabalho em altura, envolvendo o planejamento, a organização e a execução, de forma a garantir a segurança e a saúde dos trabalhadores envolvidos direta ou indiretamente com esta atividade.",
    importance: "Crucial para manutenções de fachadas, telhados, sistemas de ar condicionado em prédios e limpeza de janelas, prevenindo quedas que são causas graves de acidentes de trabalho."
  },
  {
    code: "NBR 5674",
    name: "Manutenção de Edificações — Requisitos para o Sistema de Gestão de Manutenção",
    description: "Esta Norma estabelece os requisitos para o sistema de gestão da manutenção de edificações. Ela orienta sobre como organizar as atividades de manutenção para preservar o valor do imóvel e garantir a segurança dos usuários.",
    importance: "É a norma mestre para a gestão predial, definindo como deve ser feito o plano de manutenção preventiva e corretiva."
  },
  {
    code: "NBR 16280",
    name: "Reforma em Edificações — Sistema de Gestão de Reformas",
    description: "Estabelece os requisitos para os sistemas de gestão de controle de processos, projetos, execução e segurança, incluindo reformas em unidades autônomas e áreas comuns de edificações.",
    importance: "Garante que reformas não comprometam a estrutura do prédio, exigindo plano de reforma e responsabilidade técnica (ART/RRT)."
  },
  {
    code: "NBR 15575",
    name: "Desempenho de Edificações Habitacionais (Norma de Desempenho)",
    description: "Trata do desempenho de edificações habitacionais, estabelecendo requisitos e critérios de desempenho para os sistemas que compõem a edificação (estrutural, pisos, vedações, coberturas e instalações).",
    importance: "Define prazos de garantia e a vida útil dos sistemas, sendo fundamental para o síndico e gestor saberem quando realizar manutenções pesadas."
  },
  {
    code: "Lei Federal 13.589/2018 (PMOC)",
    name: "Plano de Manutenção, Operação e Controle de Sistemas de Ar Condicionado",
    description: "Torna obrigatória a manutenção de sistemas de ar condicionado em prédios de uso coletivo (público ou privado) para garantir a boa qualidade do ar e prevenir riscos à saúde.",
    importance: "Vital em escritórios e hospitais para prevenir a proliferação de fungos, bactérias e a famosa 'Síndrome do Edifício Enfermo'."
  },
  {
    code: "RDC 50 (Anvisa)",
    name: "Planejamento, Programação, Elaboração e Avaliação de Projetos Físicos de Estabelecimentos de Saúde",
    description: "Normatiza as infraestruturas físicas de hospitais e clínicas, definindo critérios de manutenção e higiene rigorosos para ambientes de saúde.",
    importance: "Indispensável na manutenção hospitalar para garantir ambientes estéreis e seguros, evitando infecções hospitalares por falhas de infraestrutura."
  },
  {
    code: "RDC 63 (Anvisa)",
    name: "Boas Práticas de Funcionamento em Serviços de Saúde",
    description: "Estabelece requisitos de boas práticas para o funcionamento de serviços de saúde, fundamentados na qualificação, na humanização da atenção e gestão, e na redução e controle de riscos.",
    importance: "Reforça a necessidade de manutenção preventiva em equipamentos médicos e sistemas de suporte à vida em ambientes hospitalares."
  },
  {
    code: "NR 23",
    name: "Proteção Contra Incêndios",
    description: "Estabelece medidas de proteção contra incêndio que devem ser adotadas pelas empresas, visando à segurança e à integridade física dos trabalhadores e do patrimônio.",
    importance: "Regulamenta a necessidade de extintores, hidrantes, sinalização e rotas de fuga sempre desimpedidas e revisadas."
  },
  {
    code: "NBR 5410",
    name: "Instalações Elétricas de Baixa Tensão",
    description: "Esta Norma estabelece as condições a que devem satisfazer as instalações elétricas de baixa tensão, a fim de garantir a segurança de pessoas e animais, o funcionamento adequado da instalação e a conservação dos bens.",
    importance: "O guia técnico fundamental para toda a manutenção elétrica residencial, comercial e hospitalar básica."
  },
  {
    code: "NBR 5419",
    name: "Proteção contra Descargas Atmosféricas (SPDA)",
    description: "Estabelece os requisitos para determinação de risco, projeto, instalação e manutenção de sistemas de proteção contra descargas atmosféricas (para-raios).",
    importance: "Protege a edificação e equipamentos eletrônicos sensíveis contra raios, exigindo inspeções anuais ou semestrais."
  },
  {
    code: "NBR 16083",
    name: "Manutenção de Elevadores, Escadas Rolantes e Esteiras Rolantes",
    description: "Estabelece requisitos para a manutenção de elevadores, escadas rolantes e esteiras rolantes, visando a segurança dos usuários e a vida útil do equipamento.",
    importance: "Garante que sistemas críticos de transporte vertical estejam sempre seguros, exigindo manutenção mensal obrigatória em muitas prefeituras."
  }
];

export default function NormsPage() {
  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <div className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-3">
          <BookOpen size={40} />
        </div>
        <h1 className="fw-bold" style={{ color: "#083B7A" }}>📚 Normas e Obrigações</h1>
        <p className="text-muted lead mx-auto" style={{ maxWidth: "800px" }}>
          Mantenha sua organização em conformidade. Conheça as principais normas regulamentadoras (NR) 
          e técnicas (NBR) que regem a manutenção predial, hospitalar e de escritórios.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="accordion shadow-sm rounded-4 overflow-hidden border-0" id="normsAccordion">
            {NORMS.map((norm, index) => (
              <div className="accordion-item border-bottom" key={index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className={`accordion-button ${index === 0 ? '' : 'collapsed'} py-3 px-4`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                    aria-expanded={index === 0 ? "true" : "false"}
                    aria-controls={`collapse${index}`}
                    style={{ backgroundColor: index === 0 ? 'rgba(11, 94, 215, 0.05)' : 'white' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="badge bg-primary rounded-pill px-3 py-2" style={{ minWidth: "80px" }}>
                        {norm.code}
                      </div>
                      <span className="fw-semibold text-dark fs-5">{norm.name}</span>
                    </div>
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                  aria-labelledby={`heading${index}`}
                  data-bs-parent="#normsAccordion"
                >
                  <div className="accordion-body p-4 bg-white">
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold small text-uppercase">
                        <Info size={16} />
                        O que é?
                      </div>
                      <p className="text-muted mb-0 lh-lg">
                        {norm.description}
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-3 bg-light border-start border-4 border-warning">
                      <div className="d-flex align-items-center gap-2 mb-2 text-warning-emphasis fw-bold small text-uppercase">
                        <ShieldCheck size={16} />
                        Por que é importante?
                      </div>
                      <p className="mb-0 text-dark-emphasis italic">
                        {norm.importance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 bg-info-subtle rounded-4 border-0 d-flex align-items-start gap-3 shadow-sm">
            <div className="bg-info p-2 rounded-3 text-white">
              <Info size={24} />
            </div>
            <div>
              <h5 className="fw-bold text-info-emphasis">Dica de Gestão</h5>
              <p className="text-info-emphasis mb-0">
                O descumprimento destas normas pode gerar multas pesadas, interdições e, em casos de acidentes, 
                responsabilidade civil e criminal para síndicos e gestores. Utilize o <strong>Easy Maintenance</strong> 
                para agendar as inspeções obrigatórias e manter o histórico de conformidade sempre em dia.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .accordion-button:not(.collapsed) {
          color: #0B5ED7;
          box-shadow: none;
        }
        .accordion-button:focus {
          box-shadow: none;
          border-color: rgba(0,0,0,0.125);
        }
        .bg-primary-subtle {
          background-color: #e7f0fe;
        }
        .bg-info-subtle {
          background-color: #e0f7fa;
        }
      `}</style>
    </div>
  );
}
