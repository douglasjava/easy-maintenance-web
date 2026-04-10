"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { api } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type NotificationItem = {
  id: number;
  title: string;
  body: string | null;
  type: "ITEM_DUE" | "MAINTENANCE_DUE" | "SUBSCRIPTION_BLOCKED";
  referenceId: number | null;
  read: boolean;
  createdAt: string;
};

type NotificationData = {
  notifications: NotificationItem[];
  unreadCount: number;
};

const TYPE_ICON: Record<NotificationItem["type"], string> = {
  ITEM_DUE: "🔧",
  MAINTENANCE_DUE: "🛠️",
  SUBSCRIPTION_BLOCKED: "🔒",
};

function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min atrás`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

export default function NotificationBell() {
  const router = useRouter();
  const [data, setData] = useState<NotificationData>({ notifications: [], unreadCount: 0 });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res = await api.get<NotificationData>("/me/notifications");
      setData(res.data);
    } catch {
      // silently ignore — background poll should not disturb the user
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleClickNotification(n: NotificationItem) {
    if (!n.read) {
      try {
        await api.patch(`/me/notifications/${n.id}/read`);
        setData(prev => ({
          notifications: prev.notifications.map(x => x.id === n.id ? { ...x, read: true } : x),
          unreadCount: Math.max(0, prev.unreadCount - 1),
        }));
      } catch {
        // ignore
      }
    }
    setOpen(false);
  }

  async function handleMarkAllRead() {
    try {
      await api.patch("/me/notifications/read-all");
      setData(prev => ({
        notifications: prev.notifications.map(x => ({ ...x, read: true })),
        unreadCount: 0,
      }));
    } catch {
      toast.error("Erro ao marcar como lidas");
    }
  }

  const { notifications, unreadCount } = data;

  return (
    <div className="position-relative" ref={ref}>
      <button
        className="btn btn-link text-light p-1 border-0 position-relative"
        onClick={() => setOpen(o => !o)}
        aria-label="Notificações"
        style={{ lineHeight: 1 }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.6rem", minWidth: "16px" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="dropdown-menu dropdown-menu-end show shadow border-0 mt-1"
          style={{ minWidth: 320, maxHeight: 420, overflowY: "auto", right: 0, left: "auto" }}
        >
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
            <span className="fw-semibold small">Notificações</span>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm p-0 text-muted text-decoration-none small"
                onClick={handleMarkAllRead}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="text-center text-muted py-4 small">Nenhuma notificação</div>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                className={`dropdown-item d-flex gap-2 py-2 px-3 text-start ${!n.read ? "bg-light" : ""}`}
                style={{ whiteSpace: "normal", borderBottom: "1px solid #f0f0f0" }}
                onClick={() => handleClickNotification(n)}
              >
                <span style={{ fontSize: "1.1rem", lineHeight: 1.4 }}>{TYPE_ICON[n.type]}</span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex justify-content-between align-items-start gap-1">
                    <span className="fw-semibold small text-dark">{n.title}</span>
                    {!n.read && (
                      <span
                        className="bg-primary rounded-circle flex-shrink-0"
                        style={{ width: 7, height: 7, marginTop: 5 }}
                      />
                    )}
                  </div>
                  {n.body && <p className="mb-0 text-muted" style={{ fontSize: "0.78rem" }}>{n.body}</p>}
                  <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                    {formatRelative(n.createdAt)}
                  </small>
                </div>
              </button>
            ))
          )}

          {/* Footer */}
          <div className="px-3 py-2 border-top text-center">
            <button
              className="btn btn-link btn-sm p-0 text-decoration-none small"
              onClick={() => { setOpen(false); router.push("/notifications"); }}
            >
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
