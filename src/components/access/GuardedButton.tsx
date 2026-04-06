"use client";

import React from "react";

interface GuardedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  allowed: boolean;
  blockedMessage?: string;
  mode?: "hide" | "disable";
}

export function GuardedButton({ 
  allowed, 
  blockedMessage, 
  mode = "disable", 
  children, 
  disabled, 
  ...props 
}: GuardedButtonProps) {
  if (!allowed && mode === "hide") {
    return null;
  }

  const isActuallyDisabled = disabled || !allowed;

  return (
    <span className="d-inline-block" title={!allowed ? (blockedMessage || "Ação não permitida no momento") : ""}>
      <button 
        {...props} 
        disabled={isActuallyDisabled}
        style={{ 
          ...props.style, 
          pointerEvents: !allowed ? "none" : props.style?.pointerEvents 
        }}
      >
        {children}
      </button>
    </span>
  );
}
