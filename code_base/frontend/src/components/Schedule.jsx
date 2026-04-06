import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, User, Plus, X } from 'lucide-react';
import { fetchApi } from '../utils/api';

export default function Schedule({ user }) {
  const [sessions, setSessions] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({ date: '', time: '', member_id: '', trainer_id: '' });
  const [rescheduleSession, setRescheduleSession] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionsData = await fetchApi('/schedule');
        setSessions(sessionsData);
        
        const usersData = await fetchApi('/users');
        if (user.role === 'member') {
          setUsersList(usersData.filter(u => u.role === 'trainer'));
        } else {
          setUsersList(usersData.filter(u => u.role === 'member'));
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching schedule data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [user.role]);

  const handleAddSession = async (e) => {
    e.preventDefault();
    const sessionData = {
      ...newSession,
      trainer_id: user.role === 'trainer' ? user.id : newSession.trainer_id,
      member_id: user.role === 'member' ? user.id : newSession.member_id
    };
    
    try {
      const addedSession = await fetchApi('/schedule', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });
      
      setSessions([...sessions, addedSession]);
      setShowForm(false);
      setNewSession({ date: '', time: '', member_id: '', trainer_id: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    try {
      const updatedSession = await fetchApi(`/schedule/${rescheduleSession.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          date: rescheduleSession.date,
          time: rescheduleSession.time
        })
      });
      
      setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
      setRescheduleSession(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // Sort sessions by date
  const filteredSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Schedule</h1>
          <p className="text-lg text-white/60 font-medium">
            {user.role === 'member' ? 'View your upcoming training sessions.' :
             user.role === 'trainer' ? 'Manage your training sessions with members.' :
             'Overview of all facility schedules.'}
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-colors"
        >
          <Plus className="w-5 h-5" /> Schedule Session
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 mb-8 relative">
          <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-6">Schedule New Session</h2>
          <form onSubmit={handleAddSession} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-white/40 mb-2">Date</label>
              <input type="date" required value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-rose-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-500 mb-2">Time</label>
              <input type="time" required value={newSession.time} onChange={e => setNewSession({...newSession, time: e.target.value})} className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-rose-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-500 mb-2">Member</label>
              <select required value={newSession.member_id} onChange={e => setNewSession({...newSession, member_id: e.target.value})} className="w-full bg-transparent border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-rose-500">
                <option value="">Select Member</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end mt-2">
              <button type="submit" className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">Save Schedule</button>
            </div>
          </form>
        </motion.div>
      )}

      {rescheduleSession && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8 mb-8 relative">
          <button onClick={() => setRescheduleSession(null)} className="absolute top-6 right-6 text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-6">Reschedule Session</h2>
          <form onSubmit={handleReschedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-zinc-500 mb-2">New Date</label>
              <input type="date" required value={rescheduleSession.date} onChange={e => setRescheduleSession({...rescheduleSession, date: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-rose-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-500 mb-2">New Time</label>
              <input type="time" required value={rescheduleSession.time} onChange={e => setRescheduleSession({...rescheduleSession, time: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-rose-500" />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">Update Schedule</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-zinc-800/50">
          {loading ? (
            <div className="p-12 text-center text-zinc-500 font-medium">Loading schedule...</div>
          ) : filteredSessions.length > 0 ? filteredSessions.map(session => (
            <div key={session.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/10/20 transition-colors">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-rose-500 uppercase">
                    {new Date(session.date.split('-')[0], session.date.split('-')[1] - 1, session.date.split('-')[2]).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-xl font-extrabold">{session.date.split('-')[2]}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{session.type || 'Training Session'}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-zinc-400 font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {session.time}</span>
                    {user.role !== 'trainer' && <span className="flex items-center gap-1"><User className="w-4 h-4" /> Trainer: {session.trainer}</span>}
                    {user.role !== 'member' && <span className="flex items-center gap-1"><User className="w-4 h-4" /> Member: {session.member}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 bg-green-500/10 text-green-500 text-sm font-bold uppercase tracking-wider rounded-lg">Confirmed</span>
                <button 
                  onClick={() => setRescheduleSession(session)}
                  className="px-4 py-1.5 bg-zinc-800 text-white text-sm font-bold rounded-lg hover:bg-white/20 transition-colors"
                >
                  Reschedule
                </button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-zinc-500 font-medium">No sessions scheduled yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
