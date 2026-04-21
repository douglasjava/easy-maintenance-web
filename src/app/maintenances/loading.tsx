// Maintenances loading skeleton — shown during navigation to "/maintenances"
// Mirrors: 3-col header + filter card (4 inputs) + table card (6 columns, 5 rows)
// No "use client" — this is a Server Component rendered before hydration

export default function MaintenancesLoading() {
  return (
    <section style={{ backgroundColor: "#F3F4F6" }} className="p-3">

      {/* Header: back btn | title | action btns stacked */}
      <div className="row align-items-center mb-4">
        <div className="col-4">
          <span className="placeholder col-10 rounded" style={{ height: 32 }} />
        </div>
        <div className="col-4 text-center placeholder-glow">
          <span className="placeholder col-8 d-block mx-auto mb-1 rounded" style={{ height: 24 }} />
          <span className="placeholder col-10 d-block mx-auto rounded" style={{ height: 14 }} />
        </div>
        <div className="col-4 d-flex flex-column align-items-end gap-2 placeholder-glow">
          <span className="placeholder rounded" style={{ width: 110, height: 36 }} />
          <span className="placeholder rounded" style={{ width: 130, height: 30 }} />
        </div>
      </div>

      {/* Filter card skeleton */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body placeholder-glow">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <span className="placeholder col-4 d-block mb-1" style={{ height: 12 }} />
              <span className="placeholder col-12 rounded" style={{ height: 36 }} />
            </div>
            <div className="col-12 col-md-3">
              <span className="placeholder col-7 d-block mb-1" style={{ height: 12 }} />
              <span className="placeholder col-12 rounded" style={{ height: 36 }} />
            </div>
            <div className="col-12 col-md-3">
              <span className="placeholder col-6 d-block mb-1" style={{ height: 12 }} />
              <span className="placeholder col-12 rounded" style={{ height: 36 }} />
            </div>
            <div className="col-12 col-md-2">
              <span className="placeholder col-12 rounded" style={{ height: 36 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Table card skeleton */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead style={{ backgroundColor: "#F9FAFB" }}>
                <tr>
                  {["ID", "Data", "Tipo", "Responsável", "Custo", "Ações"].map((col) => (
                    <th key={col} className="text-muted small fw-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="placeholder-glow">
                {[0, 1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td><span className="placeholder col-5 rounded" style={{ height: 14 }} /></td>
                    <td><span className="placeholder col-7 rounded" style={{ height: 14 }} /></td>
                    <td><span className="placeholder col-6 rounded-pill" style={{ height: 22 }} /></td>
                    <td><span className="placeholder col-8 rounded" style={{ height: 14 }} /></td>
                    <td className="text-end"><span className="placeholder col-7 rounded" style={{ height: 14 }} /></td>
                    <td className="text-end">
                      <span className="placeholder rounded" style={{ width: 80, height: 28 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-3 border-top placeholder-glow d-flex justify-content-between">
            <span className="placeholder col-2 rounded" style={{ height: 28 }} />
            <span className="placeholder col-2 rounded" style={{ height: 28 }} />
          </div>
        </div>
      </div>

    </section>
  );
}
