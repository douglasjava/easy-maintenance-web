import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";

interface QuickAction {
    label: string;
    url: string;
    icon: string; // nome do bootstrap icon
    isPrimary?: boolean;
}

export function QuickActions() {
    const actions: QuickAction[] = [
        {
            label: "Itens",
            url: "/items",
            icon: "bi-box-seam",
            isPrimary: true,
        },
        {
            label: "Manutenção",
            url: "/maintenances",
            icon: "bi-gear",
        },
        {
            label: "Onboarding IA",
            url: "/ai-onboarding",
            icon: "bi-robot",
        },
    ];

    return (
        <div className="py-4">
            <h3 className="h6 fw-bold mb-4 text-center text-uppercase">
                Ações Rápidas
            </h3>

            <div className="d-flex flex-wrap justify-content-center gap-3">
                {actions.map((action, idx) => (
                    <Link
                        key={idx}
                        href={action.url}
                        className={`btn btn-lg px-4 py-2 fw-semibold rounded-pill shadow-sm d-flex align-items-center gap-2 ${
                            action.isPrimary
                                ? "btn-primary"
                                : "btn-outline-primary"
                        }`}
                    >
                        <i className={`bi ${action.icon}`}></i>
                        {action.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}