interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="pt-4 pb-3">
      <h1
        className="fw-bold mb-1"
        style={{ color: "#0f172a", fontSize: "clamp(1.25rem, 3vw, 1.6rem)", letterSpacing: "-0.02em" }}
      >
        {title}
      </h1>
      <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
        {subtitle}
      </p>
    </div>
  );
}
