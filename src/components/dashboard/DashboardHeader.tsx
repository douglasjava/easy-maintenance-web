interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="text-center py-5">
      <h1 className="display-6 fw-bold mb-2" style={{ color: "#0f172a", letterSpacing: "-0.025em" }}>
        {title}
      </h1>
      <p className="text-muted fs-5 mb-0">
        {subtitle}
      </p>
    </div>
  );
}
