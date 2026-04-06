"use client";

import React from "react";

interface GuardedSectionProps {
  allowed: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function GuardedSection({ allowed, children, fallback = null }: GuardedSectionProps) {
  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
