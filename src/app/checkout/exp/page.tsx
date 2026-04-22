import CheckoutStatusPage from "@/components/checkout/CheckoutStatusPage";

export const metadata = { title: "Checkout expirado — Easy Maintenance" };

export default function CheckoutExpiredPage({
  searchParams,
}: {
  searchParams?: { subscriptionId?: string };
}) {
  if (searchParams?.subscriptionId) {
    console.log("[checkout/exp] subscriptionId:", searchParams.subscriptionId);
  }

  return (
    <CheckoutStatusPage
      iconBgClass="bg-secondary-subtle"
      icon={
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          className="text-secondary"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      }
      title="Checkout expirado"
      description="O tempo para concluir o pagamento se esgotou. Gere um novo link de pagamento para continuar."
      actions={[
        { label: "Gerar novo pagamento", href: "/billing", variant: "primary" },
        { label: "Ver planos", href: "/billing", variant: "outline-secondary" },
      ]}
    />
  );
}
