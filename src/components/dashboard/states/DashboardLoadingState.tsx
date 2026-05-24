import React from "react";

export function DashboardLoadingState() {
  return (
    <div className="animate-pulse">
      {/* KPI Skeleton */}
      <div className="row g-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="col-6 col-xl-3">
            <div
              className="card border-0 shadow-sm p-4"
              style={{ borderRadius: 12, minHeight: 96 }}
              aria-hidden="true"
            >
              <div
                className="placeholder-glow"
                style={{ width: "60%", height: 12, borderRadius: 6, marginBottom: 12 }}
              >
                <span className="placeholder col-12" style={{ borderRadius: 6 }} />
              </div>
              <div className="placeholder-glow" style={{ width: "40%", height: 28, borderRadius: 6 }}>
                <span className="placeholder col-12" style={{ borderRadius: 6 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Body Skeleton */}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div
            className="card border-0 shadow-sm p-4"
            style={{ borderRadius: 12, minHeight: 280 }}
            aria-hidden="true"
          >
            <div className="placeholder-glow mb-4" style={{ width: "35%", height: 14, borderRadius: 6 }}>
              <span className="placeholder col-12" style={{ borderRadius: 6 }} />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-3 p-3 rounded-3 bg-light placeholder-glow d-flex justify-content-between">
                <div style={{ width: "55%" }}>
                  <span className="placeholder col-12 mb-2" style={{ borderRadius: 6, height: 12, display: "block" }} />
                  <span className="placeholder col-8" style={{ borderRadius: 6, height: 10, display: "block" }} />
                </div>
                <div style={{ width: "25%" }}>
                  <span className="placeholder col-12 mb-2" style={{ borderRadius: 6, height: 12, display: "block" }} />
                  <span className="placeholder col-8" style={{ borderRadius: 6, height: 10, display: "block" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div
            className="card border-0 shadow-sm p-4"
            style={{ borderRadius: 12, minHeight: 280 }}
            aria-hidden="true"
          >
            <div className="placeholder-glow mb-4" style={{ width: "40%", height: 14, borderRadius: 6 }}>
              <span className="placeholder col-12" style={{ borderRadius: 6 }} />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center mb-3 placeholder-glow">
                <span className="placeholder" style={{ width: "45%", height: 10, borderRadius: 6 }} />
                <span className="placeholder" style={{ width: "25%", height: 10, borderRadius: 6 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
