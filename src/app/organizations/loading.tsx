// Organizations loading skeleton — shown during navigation to "/organizations"
// Mirrors: flex header (title + btn) + search card + 3-column card grid
// No "use client" — this is a Server Component rendered before hydration

export default function OrganizationsLoading() {
  return (
    <div className="container py-4">

      {/* Page header: title/subtitle + action button */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 placeholder-glow">
        <div>
          <span className="placeholder col-5 d-block mb-2 rounded" style={{ height: 28 }} />
          <span className="placeholder col-8 d-block rounded" style={{ height: 16 }} />
        </div>
        <span className="placeholder rounded-3" style={{ width: 148, height: 42 }} />
      </div>

      {/* Search card skeleton */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3 placeholder-glow">
          <span className="placeholder col-12 rounded-3" style={{ height: 40 }} />
        </div>
      </div>

      {/* Organization card grid skeleton — 3 cards */}
      <div className="row g-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm h-100 rounded-4">
              <div className="card-body p-4 d-flex flex-column placeholder-glow">
                {/* Icon + badge row */}
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <span className="placeholder rounded-3" style={{ width: 52, height: 52 }} />
                  <span className="placeholder rounded-pill" style={{ width: 72, height: 26 }} />
                </div>
                {/* Org name */}
                <span className="placeholder col-8 rounded mb-1 d-block" style={{ height: 20 }} />
                <span className="placeholder col-5 rounded d-block" style={{ height: 14 }} />
                {/* Footer row */}
                <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                  <span className="placeholder col-4 rounded" style={{ height: 14 }} />
                  <span className="placeholder col-3 rounded" style={{ height: 14 }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
