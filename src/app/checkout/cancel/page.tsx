import CheckoutStatusPage from "@/components/checkout/CheckoutStatusPage";

export const metadata = { title: "Pagamento cancelado — Easy Maintenance" };

export default function CheckoutCancelPage({
  searchParams,
}: {
  searchParams?: { subscriptionId?: string };
}) {
  if (searchParams?.subscriptionId) {
    console.log("[checkout/cancel] subscriptionId:", searchParams.subscriptionId);
  }

  return (
    <CheckoutStatusPage
      iconBgClass="bg-warning-subtle"
      icon={
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          className="text-warning"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      }
      title="Pagamento cancelado"
      description="O pagamento foi cancelado. Nenhum valor foi cobrado. Você pode tentar novamente quando quiser."
      actions={[
        { label: "Tentar novamente", href: "/billing", variant: "primary" },
        { label: "Ver planos", href: "/billing", variant: "outline-secondary" },
      ]}
    />
  );
}
