"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface TopBarUserMenuProps {
  userName: string;
  roleLabel: string;
  avatarChar: string;
  children: React.ReactNode;
}

export default function TopBarUserMenu({ userName, roleLabel, avatarChar, children }: TopBarUserMenuProps) {
  return (
    <div className="dropdown">
      <button 
        className="btn btn-link text-light d-flex align-items-center gap-2 text-decoration-none border-0 p-1"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <div 
          className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
          style={{ width: 34, height: 34, fontSize: '0.9rem', fontWeight: 600 }}
        >
          {avatarChar}
        </div>
        <div className="d-none d-lg-block text-start" style={{ lineHeight: 1.1 }}>
          <small className="d-block opacity-75" style={{ fontSize: '0.7rem' }}>{roleLabel}</small>
          <span className="fw-medium" style={{ fontSize: '0.85rem' }}>{userName}</span>
        </div>
        <ChevronDown size={14} className="opacity-50" />
      </button>
      <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" style={{ minWidth: 200 }}>
        {children}
      </ul>
    </div>
  );
}
