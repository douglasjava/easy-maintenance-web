import CheckoutStatusPage from "@/components/checkout/CheckoutStatusPage";

export const metadata = { title: "Pagamento confirmado — Easy Maintenance" };

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams?: { subscriptionId?: string };
}) {
  if (searchParams?.subscriptionId) {
    console.log("[checkout/success] subscriptionId:", searchParams.subscriptionId);
  }

  return (
    <CheckoutStatusPage
      iconBgClass="bg-success-subtle"
      icon={
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          className="text-success"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      }
      title="Pagamento confirmado!"
      description="Seu pagamento foi processado com sucesso. Seu plano já está ativo e você pode usar todos os recursos disponíveis."
      actions={[
        { label: "Ir para o Dashboard", href: "/", variant: "primary" },
        { label: "Ver assinatura", href: "/billing", variant: "outline-primary" },
      ]}
    />
  );
}
