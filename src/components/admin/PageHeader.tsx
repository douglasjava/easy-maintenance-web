import Link from "next/link";

interface PageHeaderProps {
    title: string;
    description?: string;
    backUrl?: string;
    actions?: React.ReactNode;
}

export default function PageHeader({ title, description, backUrl, actions }: PageHeaderProps) {
    return (
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
            <div className="flex-grow-1">
                <h1 className="h4 m-0 text-primary-dark fw-bold">
                    {title}
                </h1>
                {description && (
                    <p className="text-muted mt-1 mb-0 small">
                        {description}
                    </p>
                )}
            </div>

            <div className="d-flex flex-wrap gap-2 align-self-stretch align-self-md-center justify-content-start justify-content-md-end">
                {backUrl && (
                    <Link className="btn btn-outline-secondary btn-sm" href={backUrl}>
                        ← Voltar
                    </Link>
                )}
                {actions}
            </div>
            <style jsx>{`
                .text-primary-dark {
                    color: #083B7A;
                }
            `}</style>
        </div>
    );
}
