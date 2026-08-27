import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCheck, Clock } from 'lucide-react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();
    socket.on('notification:event', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      socket.off('notification:event');
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-xl bg-card border border-border hover:bg-slate-800/80 text-slate-300 transition-all"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-96 bg-card border-l border-border h-full flex flex-col justify-between shadow-2xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-slate-100 text-base">Notifications</h3>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
                </button>
              )}

              {/* Notification List */}
              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1 font-mono text-xs">
                {notifications.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                        n.isRead
                          ? 'bg-slate-900/40 border-slate-900 text-slate-400'
                          : 'bg-slate-900 border-indigo-500/30 text-slate-200 shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-indigo-400">{n.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
