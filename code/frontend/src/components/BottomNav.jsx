import { LayoutDashboard, Calendar, User, CreditCard } from 'lucide-react';

export default function BottomNav({ currentView, onNavigate, userRole }) {
  const items = [
    { view: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { view: 'schedule', label: 'Schedule', icon: Calendar },
    ...(userRole === 'member' ? [{ view: 'payment', label: 'Renew', icon: CreditCard }] : []),
    { view: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all min-w-[60px] ${
              currentView === item.view
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
