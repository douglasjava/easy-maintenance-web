"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, HelpCircle, Mail, BookOpen } from "lucide-react";

type Article = {
  id: string;
  question: string;
  category: string;
  answer: string;
  steps?: string[];
  tip?: string;
};

const ARTICLES: Article[] = [
  // ─── Dashboard
  {
    id: "dashboard-overview",
    category: "Dashboard",
    question: "O que é o Dashboard e o que ele mostra?",
    answer:
      "O Dashboard é a tela inicial do Easy Maintenance. Ele apresenta uma visão consolidada da sua operação de manutenção em tempo real.",
    steps: [
      "📊 KPIs no topo: total de itens cadastrados, itens vencidos, vencendo em breve e manutenções realizadas no mês",
      "🚨 Atenção Agora: lista os equipamentos com manutenção vencida ou com prazo crítico",
      "📈 Breakdown: distribuição de itens por status, categoria e tipo",
      "⚡ Ações Rápidas: atalhos para as principais funções do sistema",
    ],
    tip: "Acesse o Dashboard clicando no logotipo da aplicação ou pelo link 'Dashboard' no menu lateral.",
  },
  {
    id: "dashboard-kpis",
    category: "Dashboard",
    question: "Por que o número de itens 'vencidos' não bate com o esperado?",
    answer:
      "Os itens são considerados 'vencidos' quando a data da próxima manutenção (nextDueAt) é anterior à data atual. Certifique-se de que os itens têm a data de próxima manutenção configurada corretamente.",
    steps: [
      "Acesse Itens no menu lateral",
      "Verifique a coluna 'Próxima Manutenção' dos itens em questão",
      "Se a data estiver incorreta, edite o item e corrija o campo",
    ],
    tip: "O Dashboard atualiza os dados em tempo real. Se fizer alterações em itens, volte ao Dashboard para ver os números atualizados.",
  },

  // ─── Itens
  {
    id: "items-what",
    category: "Itens",
    question: "O que é um Item no Easy Maintenance?",
    answer:
      "Um Item representa qualquer equipamento, ativo ou instalação que precisa de manutenção periódica. Pode ser um extintor de incêndio, um gerador, um elevador, uma central de ar-condicionado, etc.",
    steps: [
      "Cada item tem um tipo (Extintor, Gerador, Elevador...)",
      "Pode estar associado a uma norma regulatória (NBR, ANVISA...)",
      "Possui um nível de risco (Baixo, Médio, Alto, Crítico)",
      "Registra a data da próxima manutenção prevista",
    ],
    tip: "Organize seus itens por tipo e local para facilitar o gerenciamento.",
  },
  {
    id: "items-create",
    category: "Itens",
    question: "Como cadastrar um novo item?",
    answer: "Você pode cadastrar itens de duas formas: manualmente pelo formulário ou via IA com o SAMU.",
    steps: [
      "📍 Acesse o menu lateral → Itens → clique em '+ Novo Item'",
      "📝 Preencha o tipo do item, a norma aplicável (opcional) e o nível de risco",
      "📅 Informe a data da próxima manutenção prevista",
      "💾 Clique em 'Salvar' para confirmar o cadastro",
      "🤖 Alternativa: abra o SAMU (IA) e diga 'Quero cadastrar um extintor' — o assistente guiará você",
    ],
    tip: "Use o campo 'Norma' para vincular automaticamente as exigências regulatórias ao item.",
  },
  {
    id: "items-delete",
    category: "Itens",
    question: "Como excluir um item?",
    answer:
      "Um item só pode ser excluído se não possuir manutenções registradas. Se houver histórico de manutenções, o item não pode ser removido para preservar o registro de conformidade.",
    steps: [
      "Acesse Itens no menu lateral",
      "Localize o item e clique em 'Ver detalhes'",
      "Se não houver manutenções, o botão 'Excluir' estará disponível",
      "Confirme a exclusão na caixa de diálogo",
    ],
  },

  // ─── Manutenções
  {
    id: "maintenances-what",
    category: "Manutenções",
    question: "O que é uma Manutenção?",
    answer:
      "Uma Manutenção é o registro de uma intervenção realizada em um item. Pode ser preventiva (agendada), corretiva (em resposta a uma falha) ou inspeção.",
    steps: [
      "Cada manutenção está vinculada a um item específico",
      "Registra: data de realização, responsável técnico, tipo e custo",
      "Permite definir a próxima data prevista de manutenção",
    ],
    tip: "Registre manutenções imediatamente após a realização para manter o histórico preciso e cumprir exigências de auditoria.",
  },
  {
    id: "maintenances-register",
    category: "Manutenções",
    question: "Como registrar uma manutenção?",
    answer: "O registro de manutenção é feito a partir de um item já cadastrado.",
    steps: [
      "📍 Acesse Manutenções no menu lateral → clique em '+ Registrar'",
      "🔍 Selecione o item relacionado usando o filtro",
      "📅 Informe a data de realização e o tipo (Preventiva / Corretiva / Inspeção)",
      "👤 Preencha o responsável técnico e o custo (opcional)",
      "📆 Defina a próxima data de manutenção prevista",
      "💾 Clique em 'Registrar' para salvar",
    ],
    tip: "Cada item permite apenas uma manutenção por data. Se tentar registrar duas no mesmo dia, o sistema informará o conflito.",
  },
  {
    id: "maintenances-export",
    category: "Manutenções",
    question: "Como exportar o histórico de manutenções?",
    answer:
      "A exportação em CSV está disponível para planos com a feature 'reportsEnabled' ativada (planos BUSINESS e ENTERPRISE).",
    steps: [
      "Acesse Manutenções no menu lateral",
      "Aplique os filtros desejados (data, item, tipo)",
      "Clique no botão '⬇ Exportar CSV'",
      "O arquivo será baixado automaticamente com até 5.000 registros",
    ],
    tip: "Se o botão de exportação aparecer bloqueado, seu plano atual não inclui relatórios. Acesse Faturamento para fazer upgrade.",
  },

  // ─── Normas
  {
    id: "norms-what",
    category: "Normas e Obrigações",
    question: "O que são Normas e Obrigações?",
    answer:
      "Normas são regulamentos técnicos (ex: NBR 12693 para extintores, NR-17 para ergonomia) que definem a periodicidade e os critérios das manutenções. Ao vincular uma norma a um item, o sistema sabe quando cobrar a próxima manutenção.",
    steps: [
      "Cada norma tem uma autoridade emissora (ABNT, Ministério do Trabalho, ANVISA...)",
      "Define a periodicidade de manutenção em dias",
      "Pode ser associada a múltiplos itens",
    ],
  },
  {
    id: "norms-configure",
    category: "Normas e Obrigações",
    question: "Como configurar uma norma para um item?",
    answer: "Você pode vincular uma norma ao cadastrar ou editar um item.",
    steps: [
      "Acesse Itens → abra o item desejado",
      "No campo 'Norma Aplicável', selecione a norma da lista",
      "O sistema usará a periodicidade da norma para calcular a próxima data de manutenção",
      "Salve o item para aplicar a norma",
    ],
    tip: "Se a norma que você precisa não estiver na lista, entre em contato com o suporte para incluir novas normas.",
  },

  // ─── Planos e Faturamento
  {
    id: "billing-trial",
    category: "Planos e Faturamento",
    question: "O que acontece quando meu período de trial expira?",
    answer:
      "Após o trial de 7 dias, sua conta entra em modo de somente leitura. Você pode visualizar os dados existentes, mas não poderá cadastrar itens, registrar manutenções ou realizar operações de escrita.",
    steps: [
      "Acesse Faturamento no menu do usuário (canto superior direito)",
      "Escolha um plano e complete o cadastro de pagamento",
      "Assim que o pagamento for confirmado, o acesso completo é restaurado",
    ],
    tip: "Um banner de aviso aparece no Dashboard quando seu trial está próximo do vencimento.",
  },
  {
    id: "billing-upgrade",
    category: "Planos e Faturamento",
    question: "Como fazer upgrade ou downgrade do meu plano?",
    answer: "O gerenciamento de plano é feito pela tela de Faturamento.",
    steps: [
      "Clique no seu nome no canto superior direito → 'Faturamento'",
      "Na seção 'Comparativo de Planos', veja as diferenças entre os planos disponíveis",
      "Clique em 'Fazer upgrade' no plano desejado",
      "Confirme a mudança — o valor é calculado proporcionalmente (pro-rata)",
    ],
    tip: "O downgrade é aplicado no próximo ciclo de cobrança, sem perda de acesso imediato.",
  },

  // ─── Conta e Usuários
  {
    id: "users-invite",
    category: "Conta e Usuários",
    question: "Como convidar usuários para a minha organização?",
    answer: "O convite de usuários é feito pela área de Usuários.",
    steps: [
      "No menu lateral, acesse Usuários → 'Novo Usuário'",
      "Preencha o e-mail e o nome do novo usuário",
      "O usuário receberá um e-mail com instruções de acesso",
      "O número de usuários por organização depende do seu plano",
    ],
    tip: "Verifique quantos usuários seu plano permite na tela de Faturamento → Meu plano.",
  },
  {
    id: "samu-what",
    category: "Conta e Usuários",
    question: "O que é o SAMU e como funciona?",
    answer:
      "O SAMU é o assistente de IA integrado ao Easy Maintenance. Ele pode responder perguntas, ajudar a cadastrar itens via linguagem natural e auxiliar no diagnóstico de pendências.",
    steps: [
      "Clique no botão flutuante de chat no canto inferior direito da tela",
      "Digite sua dúvida em linguagem natural (ex: 'Quais itens estão vencidos?')",
      "O SAMU pode criar itens, pesquisar manutenções e orientar sobre normas",
    ],
    tip: "O SAMU está disponível apenas para planos com 'aiEnabled'. Verifique seu plano em Faturamento.",
  },
];

const CATEGORIES = [...new Set(ARTICLES.map(a => a.category))];

function ArticleCard({ article }: { article: Article }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 10 }}>
      <button
        className="card-header bg-white border-0 d-flex justify-content-between align-items-center text-start py-3 px-4 w-100"
        style={{ borderRadius: 10, cursor: "pointer" }}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="fw-semibold text-dark" style={{ fontSize: "0.95rem" }}>
          {article.question}
        </span>
        {open ? <ChevronUp size={18} className="text-muted flex-shrink-0 ms-2" /> : <ChevronDown size={18} className="text-muted flex-shrink-0 ms-2" />}
      </button>

      {open && (
        <div className="card-body border-top pt-3 px-4 pb-4">
          <p className="text-muted mb-3" style={{ lineHeight: 1.65 }}>{article.answer}</p>

          {article.steps && article.steps.length > 0 && (
            <ol className="ps-3 mb-3" style={{ lineHeight: 1.8 }}>
              {article.steps.map((s, i) => (
                <li key={i} className="text-dark small mb-1">{s}</li>
              ))}
            </ol>
          )}

          {article.tip && (
            <div className="alert alert-info py-2 px-3 mb-3 d-flex gap-2 align-items-start" style={{ fontSize: "0.83rem" }}>
              <span className="flex-shrink-0">💡</span>
              <span>{article.tip}</span>
            </div>
          )}

          {/* Support link at the end of every article */}
          <div className="border-top pt-3 mt-2 d-flex align-items-center gap-2">
            <Mail size={14} className="text-muted" />
            <span className="text-muted" style={{ fontSize: "0.78rem" }}>
              Esta resposta não resolveu?{" "}
              <a href="mailto:suporte@easymaintenance.com.br" className="text-decoration-none">
                Entre em contato com o suporte
              </a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = ARTICLES;
    if (activeCategory) result = result.filter(a => a.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        a =>
          a.question.toLowerCase().includes(q) ||
          a.answer.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [query, activeCategory]);

  const groupedFiltered = useMemo(() => {
    const groups: Record<string, Article[]> = {};
    filtered.forEach(a => {
      if (!groups[a.category]) groups[a.category] = [];
      groups[a.category].push(a);
    });
    return groups;
  }, [filtered]);

  return (
    <div>
      {/* Header */}
      <div className="text-center py-4 mb-4" style={{ background: "linear-gradient(135deg, #083B7A 0%, #0d6efd 100%)", borderRadius: 12, color: "#fff" }}>
        <HelpCircle size={40} className="mb-2 opacity-75" />
        <h4 className="fw-bold mb-1">Central de Ajuda</h4>
        <p className="mb-0 opacity-75 small">Encontre respostas rápidas sobre o Easy Maintenance</p>
      </div>

      {/* Search */}
      <div className="position-relative mb-4">
        <Search
          size={18}
          className="position-absolute text-muted"
          style={{ top: "50%", left: 14, transform: "translateY(-50%)" }}
        />
        <input
          type="text"
          className="form-control ps-5 py-2"
          placeholder="Buscar artigos e perguntas frequentes..."
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveCategory(null); }}
          style={{ borderRadius: 8, fontSize: "0.95rem" }}
        />
        {query && (
          <button
            className="btn btn-link position-absolute text-muted p-0 border-0"
            style={{ top: "50%", right: 12, transform: "translateY(-50%)" }}
            onClick={() => setQuery("")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter pills */}
      {!query && (
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            className={`btn btn-sm rounded-pill ${!activeCategory ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setActiveCategory(null)}
          >
            Todos
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm rounded-pill ${activeCategory === cat ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results count when searching */}
      {query && (
        <p className="text-muted small mb-3">
          {filtered.length === 0 ? "Nenhum resultado encontrado" : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""} para "${query}"`}
        </p>
      )}

      {/* Articles */}
      {filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <BookOpen size={40} className="mb-3 opacity-25" />
          <p className="mb-0">Nenhum artigo encontrado para essa busca.</p>
          <p className="small">
            Tente outros termos ou{" "}
            <a href="mailto:suporte@easymaintenance.com.br" className="text-decoration-none">
              contate o suporte
            </a>
            .
          </p>
        </div>
      ) : (
        Object.entries(groupedFiltered).map(([category, articles]) => (
          <div key={category} className="mb-4">
            <h6 className="fw-bold text-uppercase text-muted small mb-3 d-flex align-items-center gap-2">
              <span
                className="d-inline-block"
                style={{ width: 3, height: 16, background: "#0d6efd", borderRadius: 2 }}
              />
              {category}
            </h6>
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ))
      )}

      {/* Bottom contact section */}
      <div className="card border-0 mt-4" style={{ background: "#f8f9fa", borderRadius: 12 }}>
        <div className="card-body text-center py-4">
          <h6 className="fw-bold mb-1">Ainda precisa de ajuda?</h6>
          <p className="text-muted small mb-3">Nossa equipe de suporte está disponível para te ajudar.</p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <a
              href="mailto:suporte@easymaintenance.com.br"
              className="btn btn-primary btn-sm d-flex align-items-center gap-2"
            >
              <Mail size={15} />
              Enviar e-mail ao suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
