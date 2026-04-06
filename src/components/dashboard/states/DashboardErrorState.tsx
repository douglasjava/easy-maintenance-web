import React from "react";

interface DashboardErrorStateProps {
  message: string;
}

export function DashboardErrorState({ message }: DashboardErrorStateProps) {
  return (
    <div className="alert alert-danger border-0 shadow-sm mt-4 rounded-3">
      {message}
    </div>
  );
}
