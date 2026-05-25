export default function ItemsLoading() {
  return (
    <section style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }} className="pb-5">
      <div className="container px-3 px-md-4">

        {/* Header skeleton */}
        <div className="pt-4 pb-3">
          <span className="placeholder rounded mb-3 d-block" style={{ height: 14, width: 80 }} />
          <div className="d-flex justify-content-between align-items-start gap-3 placeholder-glow">
            <div>
              <span className="placeholder rounded d-block mb-2" style={{ height: 26, width: 80 }} />
              <span className="placeholder rounded d-block" style={{ height: 14, width: 240 }} />
            </div>
            <span className="placeholder rounded" style={{ height: 36, width: 110 }} />
          </div>
        </div>

        {/* Filter card skeleton */}
        <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 10 }}>
          <div className="card-body py-3 px-3 placeholder-glow">
            <div className="row g-2 align-items-end">
              <div className="col-6 col-md-2">
                <span className="placeholder rounded d-block mb-1" style={{ height: 10, width: "50%" }} />
                <span className="placeholder rounded d-block" style={{ height: 31 }} />
              </div>
              <div className="col-6 col-md-2">
                <span className="placeholder rounded d-block mb-1" style={{ height: 10, width: "60%" }} />
                <span className="placeholder rounded d-block" style={{ height: 31 }} />
              </div>
              <div className="col-12 col-md-6">
                <span className="placeholder rounded d-block mb-1" style={{ height: 10, width: "40%" }} />
                <span className="placeholder rounded d-block" style={{ height: 31 }} />
              </div>
              <div className="col-12 col-md-2">
                <span className="placeholder rounded d-block" style={{ height: 31 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Table/card skeleton */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: 10 }}>
          <div className="card-body p-0">

            {/* Desktop table skeleton */}
            <div className="d-none d-md-block table-responsive">
              <table className="table align-middle mb-0">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    {["Item", "Categoria", "Próx. vencimento", "Status", ""].map((col, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 16px",
                          color: "#9ca3af",
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="placeholder-glow">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <span className="placeholder rounded" style={{ height: 14, width: "70%" }} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className="placeholder rounded-pill" style={{ height: 20, width: 80 }} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className="placeholder rounded" style={{ height: 14, width: 80 }} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className="placeholder rounded-pill" style={{ height: 22, width: 72 }} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div className="d-flex gap-1 justify-content-end">
                          <span className="placeholder rounded" style={{ height: 26, width: 48 }} />
                          <span className="placeholder rounded" style={{ height: 26, width: 48 }} />
                          <span className="placeholder rounded" style={{ height: 26, width: 62 }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card skeleton */}
            <div className="d-md-none p-2 d-flex flex-column gap-2 placeholder-glow">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-3"
                  style={{ border: "1px solid #e5e7eb", borderLeft: "3px solid #e5e7eb", backgroundColor: "#fff", overflow: "hidden" }}
                >
                  <div className="d-flex justify-content-between align-items-start gap-2 px-3 pt-3 pb-1">
                    <span className="placeholder rounded" style={{ height: 16, width: "55%" }} />
                    <span className="placeholder rounded-pill" style={{ height: 22, width: 68 }} />
                  </div>
                  <div className="d-flex justify-content-between align-items-center px-3 pb-2 gap-2">
                    <span className="placeholder rounded-pill" style={{ height: 20, width: 80 }} />
                    <span className="placeholder rounded" style={{ height: 12, width: 100 }} />
                  </div>
                  <div
                    className="d-flex gap-2 px-3 py-2"
                    style={{ borderTop: "1px solid #f1f5f9", backgroundColor: "#fafafa" }}
                  >
                    <span className="placeholder rounded flex-fill" style={{ height: 30 }} />
                    <span className="placeholder rounded flex-fill" style={{ height: 30 }} />
                    <span className="placeholder rounded flex-fill" style={{ height: 30 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination skeleton */}
            <div
              className="px-3 py-3 d-flex justify-content-between align-items-center placeholder-glow"
              style={{ borderTop: "1px solid #f1f5f9" }}
            >
              <span className="placeholder rounded" style={{ height: 28, width: 120 }} />
              <span className="placeholder rounded" style={{ height: 28, width: 160 }} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
