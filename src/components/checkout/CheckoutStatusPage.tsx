import Link from "next/link";
import Image from "next/image";

export interface CheckoutAction {
  label: string;
  href: string;
  variant: "primary" | "outline-primary" | "outline-secondary";
}

export interface CheckoutStatusPageProps {
  iconBgClass: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  actions: CheckoutAction[];
  /** Optional extra context logged to console on client for future analytics */
  logTag?: string;
}

export default function CheckoutStatusPage({
  iconBgClass,
  icon,
  title,
  description,
  actions,
}: CheckoutStatusPageProps) {
  return (
    <div
      className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light px-3 py-5"
    >
      <div className="mb-4">
        <Image src="/logo.png" alt="Easy Maintenance" width={150} height={40} priority />
      </div>

      <div
        className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center"
        style={{ maxWidth: 480, width: "100%" }}
      >
        <div
          className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 ${iconBgClass}`}
          style={{ width: 72, height: 72 }}
        >
          {icon}
        </div>

        <h1 className="fw-bold fs-3 mb-2">{title}</h1>
        <p className="text-muted mb-4">{description}</p>

        <div className="d-flex flex-column gap-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`btn btn-${action.variant} rounded-3 fw-semibold py-2`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-muted small mt-4">
        Easy Maintenance — Manutenções regulatórias e operacionais
      </p>
    </div>
  );
}
