import { useState, useEffect, useRef } from 'react';
import { Dumbbell, User, Menu, X, Bell, LayoutDashboard, Calendar, LogOut } from 'lucide-react';
import { fetchApi } from '../utils/api';

export default function Navbar({ user, onLogout, onNavigate, currentView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifsRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchApi('/notifications')
        .then(data => setNotifications(data || []))
        .catch(() => {});
    }
  }, [user, currentView]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await fetchApi('/notifications/read', { method: 'PUT', body: JSON.stringify({}) });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const navItems = user ? [
    { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
    { label: 'Schedule', view: 'schedule', icon: Calendar },
    { label: 'Profile', view: 'profile', icon: User },
  ] : [];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { onNavigate(user ? 'dashboard' : 'landing'); setMenuOpen(false); }}>
            <Dumbbell className="w-7 h-7 sm:w-8 sm:h-8 text-rose-500" />
            <span className="text-xl sm:text-2xl font-extrabold tracking-tighter text-white">MUSCLE<span className="text-rose-500"> UP</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <button
                onClick={() => onNavigate('auth')}
                className="px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-full transition-colors"
              >
                Login / Register
              </button>
            ) : (
              <>
                <button onClick={() => onNavigate('dashboard')} className={`text-sm font-semibold transition-colors ${currentView === 'dashboard' ? 'text-white' : 'text-white/60 hover:text-white'}`}>Dashboard</button>
                <button onClick={() => onNavigate('schedule')} className={`text-sm font-semibold transition-colors ${currentView === 'schedule' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>Schedule</button>
                <div className="flex items-center gap-3 ml-2 pl-6 border-l border-zinc-800">
                  {/* Notifications */}
                  <div className="relative" ref={notifsRef}>
                    <button
                      onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs && unreadCount > 0) markAllRead(); }}
                      className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:border-white/30 transition-colors"
                    >
                      <Bell className="w-5 h-5 text-zinc-400" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    {showNotifs && (
                      <div className="absolute right-0 mt-2 w-80 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                          <span className="font-bold">Notifications</span>
                          {notifications.length > 0 && (
                            <button onClick={markAllRead} className="text-xs text-rose-500 hover:text-rose-400 font-medium">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-zinc-500 text-center">No notifications</p>
                          ) : notifications.map(n => (
                            <div key={n.id} className={`p-4 border-b border-white/5 ${n.is_read ? 'opacity-60' : ''}`}>
                              <div className="flex items-start gap-3">
                                {!n.is_read && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />}
                                <div>
                                  <p className="text-sm font-bold text-white">{n.title}</p>
                                  <p className="text-xs text-zinc-400 mt-0.5">{n.message}</p>
                                  <p className="text-xs text-zinc-600 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onNavigate('profile')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${currentView === 'profile' ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'bg-white/10 border-white/20 text-zinc-400 hover:text-white'}`}
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <button onClick={onLogout} className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Right */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <div className="relative" ref={notifsRef}>
                <button
                  onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs && unreadCount > 0) markAllRead(); }}
                  className="relative w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10"
                >
                  <Bell className="w-4 h-4 text-zinc-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-72 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                      <span className="font-bold text-sm">Notifications</span>
                      {notifications.length > 0 && (
                        <button onClick={markAllRead} className="text-xs text-rose-500 font-medium">Mark all read</button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-3 text-sm text-zinc-500 text-center">No notifications</p>
                      ) : notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-white/5 ${n.is_read ? 'opacity-60' : ''}`}>
                          <div className="flex items-start gap-2">
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />}
                            <div>
                              <p className="text-xs font-bold text-white">{n.title}</p>
                              <p className="text-xs text-zinc-400 mt-0.5">{n.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/10"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 px-4 pb-4 pt-2">
          {!user ? (
            <button
              onClick={() => { onNavigate('auth'); setMenuOpen(false); }}
              className="w-full py-3 bg-rose-600 text-white font-bold rounded-2xl mt-2"
            >
              Login / Register
            </button>
          ) : (
            <div className="space-y-1 pt-2">
              {navItems.map(item => (
                <button
                  key={item.view}
                  onClick={() => { onNavigate(item.view); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-colors ${
                    currentView === item.view ? 'bg-rose-500/10 text-rose-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { onLogout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

