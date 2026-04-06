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

  useEffect(() => {
    let title = 'MUSCLE UP';
    switch (currentView) {
      case 'landing': title = 'Home | MUSCLE UP'; break;
      case 'auth': title = 'Login | MUSCLE UP'; break;
      case 'profile': title = 'Profile | MUSCLE UP'; break;
      case 'schedule': title = 'Schedule | MUSCLE UP'; break;
      case 'dashboard':
        if (user?.role === 'admin') title = 'Admin Dashboard | MUSCLE UP';
        else if (user?.role === 'trainer') title = 'Trainer Dashboard | MUSCLE UP';
        else title = 'Member Dashboard | MUSCLE UP';
        break;
      default: title = 'MUSCLE UP';
    }
    document.title = title;
  }, [currentView, user]);

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
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-rose-500/30">
      <Navbar user={user} onLogout={handleLogout} onNavigate={setCurrentView} currentView={currentView} />
      {renderView()}
    </div>
  );
}
