"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <TopBar />
      <Sidebar />
      <main className="container my-3">{children}</main>
    </div>
  );
}
