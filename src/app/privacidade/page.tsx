import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Política de Privacidade",
    description:
        "Política de privacidade e termos de uso do Easy Maintenance. Saiba como coletamos, usamos e protegemos seus dados pessoais conforme a LGPD.",
    alternates: {
        canonical: "https://easymaintenance.com.br/privacidade",
    },
};

export default function PrivacidadePage() {
    return (
        <div className="container py-5" style={{ maxWidth: 760 }}>
            <h1 className="fw-bold mb-1">Política de Privacidade</h1>
            <p className="text-muted small mb-5">Última atualização: junho de 2026</p>

            <section className="mb-4">
                <h5 className="fw-bold">1. Quem somos</h5>
                <p className="text-muted">
                    A <strong>Easy Maintenance</strong> é uma plataforma SaaS de gestão de manutenção preventiva.
                    Operamos sob a legislação brasileira, incluindo a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
                </p>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">2. Dados que coletamos</h5>
                <ul className="text-muted">
                    <li><strong>Dados de cadastro:</strong> nome, e-mail e senha (armazenada com hash bcrypt).</li>
                    <li><strong>Dados de faturamento:</strong> CPF/CNPJ, endereço e método de pagamento, quando fornecidos.</li>
                    <li><strong>Dados de uso:</strong> logs de acesso, registros de manutenções e ativos cadastrados.</li>
                    <li><strong>Dados técnicos:</strong> endereço IP, user-agent e tokens de sessão (para segurança).</li>
                </ul>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">3. Como usamos seus dados</h5>
                <ul className="text-muted">
                    <li>Prestação do serviço contratado (gestão de manutenção e ativos).</li>
                    <li>Processamento de pagamentos e emissão de cobranças.</li>
                    <li>Envio de notificações transacionais (alertas de prazo, confirmações).</li>
                    <li>Segurança da conta (autenticação em dois fatores, auditoria de acessos).</li>
                    <li>Cumprimento de obrigações legais e regulatórias.</li>
                </ul>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">4. Compartilhamento de dados</h5>
                <p className="text-muted">
                    Não vendemos seus dados. Compartilhamos apenas com:
                </p>
                <ul className="text-muted">
                    <li><strong>Asaas:</strong> processador de pagamentos, para cobrança e gestão de assinaturas.</li>
                    <li><strong>Autoridades competentes:</strong> quando exigido por lei ou ordem judicial.</li>
                </ul>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">5. Seus direitos (LGPD)</h5>
                <p className="text-muted">Você tem direito a:</p>
                <ul className="text-muted">
                    <li><strong>Acesso e portabilidade:</strong> exportar seus dados pessoais em formato JSON na seção <a href="/profile">Minha Conta → Privacidade e Dados</a>.</li>
                    <li><strong>Exclusão (direito ao esquecimento):</strong> solicitar a anonimização e exclusão da conta pela mesma seção.</li>
                    <li><strong>Correção:</strong> atualizar seus dados diretamente no perfil.</li>
                    <li><strong>Revogação de consentimento:</strong> encerrar o uso da plataforma a qualquer momento.</li>
                </ul>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">6. Retenção de dados</h5>
                <p className="text-muted">
                    Dados operacionais são mantidos pelo período de vigência do contrato e, após encerramento,
                    pelo prazo mínimo exigido pela legislação fiscal e tributária (5 anos). Dados pessoais são
                    anonimizados imediatamente após a solicitação de exclusão de conta.
                </p>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">7. Segurança</h5>
                <p className="text-muted">
                    Adotamos criptografia em repouso e em trânsito (TLS), hashing de senhas (BCrypt),
                    autenticação em dois fatores opcional e logs de auditoria para todas as operações críticas.
                </p>
            </section>

            <section className="mb-4">
                <h5 className="fw-bold">8. Contato</h5>
                <p className="text-muted">
                    Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato pelo e-mail:{" "}
                    <a href="mailto:comercial@easymaintenance.com.br">comercial@easymaintenance.com.br</a>
                </p>
            </section>

            <div className="mt-5 pt-3 border-top">
                <a href="/profile" className="btn btn-outline-secondary btn-sm">← Voltar para Minha Conta</a>
            </div>
        </div>
    );
}
