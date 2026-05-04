"use client";

import React from "react";
import BrandLogo from "@/components/ui/BrandLogo";

interface TopBarBrandProps {
  label: string;
}

export default function TopBarBrand({ label }: TopBarBrandProps) {
  return (
    <div className="d-flex align-items-center">
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#appSidebar"
        aria-controls="appSidebar"
        aria-label="Abrir menu"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <span className="navbar-brand ms-2 d-none d-sm-flex align-items-center" aria-label={label}>
        <BrandLogo variant="horizontal" width={140} height={36} />
      </span>
    </div>
  );
}
