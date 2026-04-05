import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Profile from './components/Profile';
import MemberDashboard from './components/MemberDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Schedule from './components/Schedule';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token && token !== 'undefined' && token !== 'null') {
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('landing');
  };

  const renderView = () => {
    if (currentView === 'auth') return <Auth onLogin={handleLogin} />;
    if (currentView === 'profile' && user) return <Profile user={user} />;
    if (currentView === 'schedule' && user) return <Schedule user={user} />;
    if (currentView === 'dashboard' && user) {
      if (user.role === 'admin') return <AdminDashboard user={user} onNavigate={setCurrentView} />;
      if (user.role === 'trainer') return <TrainerDashboard user={user} onNavigate={setCurrentView} />;
      return <MemberDashboard user={user} onNavigate={setCurrentView} />;
    }
    return <Landing onNavigate={setCurrentView} />;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-rose-500/30">
      <Navbar user={user} onLogout={handleLogout} onNavigate={setCurrentView} currentView={currentView} />
      {renderView()}
    </div>
  );
}
