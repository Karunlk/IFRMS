import { Dumbbell, User } from 'lucide-react';

export default function Navbar({ user, onLogout, onNavigate, currentView }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/10/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(user ? 'dashboard' : 'landing')}>
            <Dumbbell className="w-8 h-8 text-rose-500" />
            <span className="text-2xl font-extrabold tracking-tighter text-white">MUSCLE<span className="text-rose-500"> UP</span></span>
          </div>
          <div className="flex items-center gap-6">
            {!user ? (
              <>
                <button 
                  onClick={() => onNavigate('auth')}
                  className="ml-2 px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-full transition-colors"
                >
                  Login / Register
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onNavigate('dashboard')} className={`text-sm font-semibold transition-colors hidden md:block ${currentView === 'dashboard' ? 'text-white' : 'text-white/60 hover:text-white'}`}>Dashboard</button>
                <button onClick={() => onNavigate('schedule')} className={`text-sm font-semibold transition-colors hidden md:block ${currentView === 'schedule' ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>Schedule</button>
                <div className="flex items-center gap-3 ml-2 md:ml-4 md:pl-6 md:border-l border-zinc-800">
                  <button 
                    onClick={() => onNavigate('profile')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${currentView === 'profile' ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'bg-white/10 border-white/20 text-zinc-400 hover:text-white'}`}
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={onLogout}
                    className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
