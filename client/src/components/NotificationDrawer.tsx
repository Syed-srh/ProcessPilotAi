import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
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
        className="relative p-1.5 rounded-md bg-[#0D1117] border border-[#30363D] hover:bg-[#21262D] text-slate-300 transition-all"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black font-mono">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-96 bg-[#161B22] border-l border-[#30363D] h-full flex flex-col justify-between p-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-slate-100 text-sm font-display">Telemetry Notifications</h3>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
                </button>
              )}

              {/* Notification List */}
              <div className="space-y-2.5 max-h-[78vh] overflow-y-auto pr-1 font-mono text-xs">
                {notifications.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    No notifications recorded.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer space-y-1 ${
                        n.isRead
                          ? 'bg-[#0D1117]/60 border-[#30363D] text-slate-500'
                          : 'bg-[#0D1117] border-cyan-500/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-cyan-400 text-[11px]">{n.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px] font-sans">{n.message}</p>
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
