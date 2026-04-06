"use client";

import React from "react";

interface TopBarShellProps {
  children: React.ReactNode;
}

export default function TopBarShell({ children }: TopBarShellProps) {
  return (
    <nav className="navbar navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        {children}
      </div>
    </nav>
  );
}
