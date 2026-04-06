"use client";

import React from "react";

interface FeatureGuardProps {
  enabled: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureGuard({ enabled, fallback = null, children }: FeatureGuardProps) {
  if (!enabled) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
