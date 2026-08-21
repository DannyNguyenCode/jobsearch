"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { AppNotification } from "@/lib/notifications";

type NotificationsResponse = {
  notifications?: AppNotification[];
  unreadCount?: number;
};

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) return;
      const result = (await response.json()) as NotificationsResponse;
      setNotifications(result.notifications ?? []);
      setUnreadCount(result.unreadCount ?? 0);
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const timer = window.setInterval(() => {
      void loadNotifications();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  async function markRead(notification: AppNotification) {
    if (!notification.read) {
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      await fetch(`/api/notifications/${notification.id}`, { method: "PATCH" });
    }
    setOpen(false);
  }

  async function markAllRead() {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    await fetch("/api/notifications", { method: "PATCH" });
  }

  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className="btn btn-ghost btn-circle"
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          void loadNotifications();
        }}
      >
        <span className="indicator">
          {unreadCount > 0 ? (
            <span className="indicator-item badge badge-error badge-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
          <Icon filled={unreadCount > 0} name="notifications" />
        </span>
      </button>
      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-xl border border-outline-variant bg-base-100 shadow-lg p-0"
          role="menu"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-outline-variant">
            <p className="font-semibold">Notifications</p>
            {unreadCount > 0 ? (
              <button className="btn btn-ghost btn-xs text-primary" type="button" onClick={markAllRead}>
                Mark all read
              </button>
            ) : null}
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">No notifications yet.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <Link
                    className={`block px-4 py-3 hover:bg-primary-fixed/40 ${notification.read ? "" : "bg-primary-fixed/20"}`}
                    href={notification.href || "#"}
                    onClick={() => {
                      void markRead(notification);
                    }}
                  >
                    <p className="font-semibold truncate">{notification.title}</p>
                    <p className="text-sm text-muted truncate">{notification.body}</p>
                    <p className="text-xs text-outline mt-1">{notification.createdAt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
