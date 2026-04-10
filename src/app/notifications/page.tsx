"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Bell, CheckCheck } from "lucide-react";
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

const TYPE_LABEL: Record<NotificationItem["type"], string> = {
  ITEM_DUE: "Item",
  MAINTENANCE_DUE: "Manutenção",
  SUBSCRIPTION_BLOCKED: "Assinatura",
};

const TYPE_BADGE: Record<NotificationItem["type"], string> = {
  ITEM_DUE: "bg-warning text-dark",
  MAINTENANCE_DUE: "bg-info text-dark",
  SUBSCRIPTION_BLOCKED: "bg-danger",
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  async function fetchNotifications() {
    try {
      const res = await api.get<{ notifications: NotificationItem[]; unreadCount: number }>("/me/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch {
      toast.error("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNotifications(); }, []);

  async function handleMarkAsRead(id: number, alreadyRead: boolean) {
    if (alreadyRead) return;
    try {
      await api.patch(`/me/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      toast.error("Erro ao marcar notificação como lida");
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await api.patch("/me/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("Todas as notificações foram marcadas como lidas");
    } catch {
      toast.error("Erro ao marcar notificações como lidas");
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Bell size={22} />
            Notificações
          </h4>
          {unreadCount > 0 && (
            <small className="text-muted">{unreadCount} não lida{unreadCount !== 1 ? "s" : ""}</small>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={handleMarkAllRead}
            disabled={markingAll}
          >
            <CheckCheck size={16} />
            {markingAll ? "Marcando..." : "Marcar todas como lidas"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Carregando...</div>
      ) : notifications.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5 text-muted">
            <Bell size={40} className="mb-3 opacity-25" />
            <p className="mb-0">Você não tem notificações</p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <ul className="list-group list-group-flush">
            {notifications.map(n => (
              <li
                key={n.id}
                className={`list-group-item d-flex gap-3 py-3 ${!n.read ? "bg-light" : ""}`}
                style={{ cursor: n.read ? "default" : "pointer" }}
                onClick={() => handleMarkAsRead(n.id, n.read)}
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="fw-semibold">{n.title}</span>
                      <span className={`badge ${TYPE_BADGE[n.type]}`} style={{ fontSize: "0.7rem" }}>
                        {TYPE_LABEL[n.type]}
                      </span>
                      {!n.read && (
                        <span className="badge bg-primary" style={{ fontSize: "0.65rem" }}>Nova</span>
                      )}
                    </div>
                    <small className="text-muted text-nowrap">{formatDate(n.createdAt)}</small>
                  </div>
                  {n.body && <p className="mb-0 text-muted small">{n.body}</p>}
                  {!n.read && (
                    <small className="text-primary mt-1 d-block" style={{ fontSize: "0.75rem" }}>
                      Clique para marcar como lida
                    </small>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
