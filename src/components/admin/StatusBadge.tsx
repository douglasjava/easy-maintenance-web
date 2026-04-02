interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const getBadgeConfig = (status: string) => {
        const s = status?.toUpperCase();
        switch (s) {
            case "ACTIVE":
            case "ATIVO":
            case "PAID":
            case "PAGO":
                return { className: "bg-success-subtle text-success border-success-subtle", label: "Ativo" };
            case "INACTIVE":
            case "INATIVO":
            case "CANCELED":
            case "CANCELADO":
                return { className: "bg-danger-subtle text-danger border-danger-subtle", label: "Inativo" };
            case "PENDING":
            case "PENDENTE":
                return { className: "bg-warning-subtle text-warning border-warning-subtle", label: "Pendente" };
            case "TRIALING":
            case "EM TESTE":
                return { className: "bg-info-subtle text-info border-info-subtle", label: "Em teste" };
            default:
                return { className: "bg-secondary-subtle text-secondary border-secondary-subtle", label: status };
        }
    };

    const { className, label } = getBadgeConfig(status);

    return (
        <span className={`badge border ${className}`}>
            {label}
        </span>
    );
}
