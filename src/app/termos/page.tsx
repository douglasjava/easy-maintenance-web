import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
    title: "Termos de Uso",
    description:
        "Termos de Uso do Easy Maintenance: condições de contratação, planos, cobrança, cancelamento e responsabilidades do usuário.",
    alternates: {
        canonical: "https://easymaintenance.com.br/termos",
    },
};

export default function TermosPage() {
    return (
        <>
            <nav className="navbar navbar-light bg-white sticky-top shadow-sm">
                <div className="container">
                    <Link href="/landing" className="navbar-brand mb-0">
                        <Logo />
                    </Link>
                </div>
            </nav>
            <div className="container py-5" style={{ maxWidth: 760 }}>
                <h1 className="fw-bold mb-1">Termos de Uso</h1>
                <p className="text-muted small mb-5">Última atualização: julho de 2026</p>

                <section className="mb-4">
                    <h5 className="fw-bold">1. Partes</h5>
                    <p className="text-muted">
                        Estes Termos de Uso regulam a contratação da plataforma <strong>Easy Maintenance</strong>,
                        de titularidade de <strong>BRAINBYTE CONSULTORIA TI LTDA</strong>, inscrita no CNPJ sob o
                        nº 50.047.256/0001-22 (&quot;Easy Maintenance&quot;, &quot;nós&quot;), e o cliente que realiza o cadastro
                        na plataforma (&quot;Cliente&quot;, &quot;você&quot;). Ao criar uma conta ou utilizar o serviço, você declara
                        ter lido, compreendido e aceitado integralmente estes termos.
                    </p>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">2. Objeto</h5>
                    <p className="text-muted">
                        O Easy Maintenance é uma plataforma SaaS (software como serviço) de gestão de manutenção
                        preventiva de ativos, voltada a condomínios, hospitais, escolas, indústrias e organizações
                        em geral, incluindo controle de ativos, agenda de vencimentos, evidências de execução,
                        relatórios e trilha de auditoria.
                    </p>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">3. Cadastro e conta</h5>
                    <ul className="text-muted">
                        <li>Você é responsável por manter a confidencialidade das credenciais de acesso à sua conta.</li>
                        <li>As informações fornecidas no cadastro devem ser verdadeiras, completas e mantidas atualizadas.</li>
                        <li>Você é responsável por toda atividade realizada na sua conta, inclusive por usuários adicionais que convidar para sua organização.</li>
                    </ul>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">4. Período de teste, planos e cobrança</h5>
                    <ul className="text-muted">
                        <li><strong>Período de teste (trial):</strong> novas contas têm acesso gratuito por 14 dias, sem necessidade de cartão de crédito. Ao final do período, é necessário selecionar um plano pago para continuar utilizando a plataforma.</li>
                        <li><strong>Planos e preços:</strong> os planos disponíveis, seus limites (nº de ativos, usuários, organizações) e valores vigentes são exibidos na plataforma antes da contratação. Reservamo-nos o direito de alterar preços mediante aviso prévio, sem efeito retroativo sobre ciclos já pagos.</li>
                        <li><strong>Formas de pagamento:</strong> cartão de crédito (cobrança recorrente automática) ou Pix (cobrança avulsa por ciclo), processados pelo parceiro de pagamentos Asaas.</li>
                        <li><strong>Inadimplência:</strong> a falta de pagamento pode resultar em restrição de acesso a funcionalidades até a regularização, conforme política de cobrança vigente na plataforma.</li>
                    </ul>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">5. Cancelamento e reembolso</h5>
                    <p className="text-muted">
                        Você pode cancelar sua assinatura a qualquer momento diretamente na plataforma. O
                        cancelamento interrompe cobranças futuras, mas <strong>não gera reembolso, total ou
                        proporcional, de valores já pagos</strong> referentes ao ciclo ou período vigente. O acesso à
                        plataforma permanece disponível até o fim do ciclo já pago.
                    </p>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">6. Uso aceitável</h5>
                    <p className="text-muted">Ao utilizar o Easy Maintenance, você concorda em não:</p>
                    <ul className="text-muted">
                        <li>Utilizar a plataforma para fins ilícitos ou que violem direitos de terceiros;</li>
                        <li>Tentar acessar dados de outras organizações sem autorização;</li>
                        <li>Realizar engenharia reversa, copiar ou revender o software sem autorização expressa;</li>
                        <li>Sobrecarregar deliberadamente a infraestrutura do serviço (ex.: automações abusivas, scraping).</li>
                    </ul>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">7. Dados e privacidade</h5>
                    <p className="text-muted">
                        O tratamento de dados pessoais é regido pela nossa{" "}
                        <Link href="/privacidade">Política de Privacidade</Link>, elaborada em conformidade com a
                        LGPD (Lei nº 13.709/2018). Os dados operacionais inseridos na plataforma (ativos,
                        manutenções, evidências) são de propriedade do Cliente; utilizamos esses dados apenas para
                        prestar o serviço contratado.
                    </p>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">8. Propriedade intelectual</h5>
                    <p className="text-muted">
                        O software, marca, layout e demais elementos do Easy Maintenance são de propriedade da
                        BRAINBYTE CONSULTORIA TI LTDA. A contratação do serviço concede ao Cliente uma licença de
                        uso não exclusiva e intransferível, pelo período da assinatura, não constituindo cessão de
                        propriedade intelectual.
                    </p>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">9. Disponibilidade e limitação de responsabilidade</h5>
                    <p className="text-muted">
                        Envidamos esforços para manter a plataforma disponível de forma contínua, mas não
                        garantimos disponibilidade ininterrupta, podendo haver manutenções programadas ou
                        interrupções não planejadas. O Easy Maintenance é uma ferramenta de apoio à gestão de
                        manutenção e não substitui a responsabilidade técnica e legal do Cliente pela manutenção
                        de seus próprios ativos e pelo cumprimento de normas técnicas (ex.: ABNT) e regulatórias
                        aplicáveis. Na máxima extensão permitida em lei, nossa responsabilidade se limita ao valor
                        pago pelo Cliente nos últimos 12 (doze) meses.
                    </p>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">10. Rescisão</h5>
                    <p className="text-muted">
                        Podemos suspender ou encerrar o acesso de contas que violem estes Termos, mediante aviso
                        prévio quando possível. Em caso de encerramento da conta, seus dados são tratados conforme
                        a seção de retenção da nossa Política de Privacidade.
                    </p>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">11. Alterações destes termos</h5>
                    <p className="text-muted">
                        Podemos atualizar estes Termos de Uso periodicamente. Alterações relevantes serão
                        comunicadas por e-mail ou aviso na plataforma, com antecedência razoável. O uso continuado
                        do serviço após a alteração constitui aceite dos novos termos.
                    </p>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">12. Lei aplicável e foro</h5>
                    <p className="text-muted">
                        Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro
                        do domicílio do Cliente para dirimir eventuais controvérsias, salvo disposição contratual
                        específica em contrário.
                    </p>
                </section>

                <section className="mb-4">
                    <h5 className="fw-bold">13. Contato</h5>
                    <p className="text-muted">
                        Dúvidas sobre estes Termos podem ser enviadas para:{" "}
                        <a href="mailto:comercial@easymaintenance.com.br">comercial@easymaintenance.com.br</a>
                    </p>
                </section>

                <div className="mt-5 pt-3 border-top">
                    <Link href="/landing" className="btn btn-outline-secondary btn-sm">← Voltar para o site</Link>
                </div>
            </div>
        </>
    );
}
