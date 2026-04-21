// Dashboard loading skeleton — shown during navigation to "/"
// Mirrors: DashboardHeader + KPIGrid (4 cards) + content area
// No "use client" — this is a Server Component rendered before hydration

export default function DashboardLoading() {
  return (
    <section style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} className="pb-5">
      <div className="container">

        {/* DashboardHeader skeleton */}
        <div className="text-center py-5">
          <div className="placeholder-glow mb-2 d-flex justify-content-center">
            <span className="placeholder rounded" style={{ width: 240, height: 36 }} />
          </div>
          <div className="placeholder-glow d-flex justify-content-center">
            <span className="placeholder rounded" style={{ width: 340, height: 20 }} />
          </div>
        </div>

        {/* KPI Grid skeleton — 4 cards */}
        <div className="row g-4 mb-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="col-12 col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                <div className="card-body p-4 placeholder-glow">
                  <span className="placeholder col-7 mb-2 d-block" style={{ height: 12 }} />
                  <span className="placeholder col-4 d-block" style={{ height: 36 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content area skeleton — attention list + breakdown */}
        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <div className="card border-0 shadow-sm">
              <div className="card-body placeholder-glow">
                <span className="placeholder col-5 mb-4 d-block" style={{ height: 18 }} />
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="d-flex align-items-center gap-3 mb-3">
                    <span className="placeholder rounded-circle flex-shrink-0" style={{ width: 36, height: 36 }} />
                    <div className="flex-grow-1">
                      <span className="placeholder col-6 d-block mb-1" style={{ height: 14 }} />
                      <span className="placeholder col-4 d-block" style={{ height: 12 }} />
                    </div>
                    <span className="placeholder col-2 rounded-pill" style={{ height: 22 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body placeholder-glow">
                <span className="placeholder col-6 mb-4 d-block" style={{ height: 18 }} />
                {[0, 1, 2].map((i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-3">
                    <span className="placeholder col-5" style={{ height: 14 }} />
                    <span className="placeholder col-3 rounded-pill" style={{ height: 22 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
