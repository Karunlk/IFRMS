import { useState, useEffect } from 'react';
import { Users, Calendar, Activity, FileEdit, Plus, X, TrendingUp } from 'lucide-react';
import { fetchApi } from '../utils/api';

export default function TrainerDashboard({ user, onNavigate }) {
  const [schedules, setSchedules] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ member_id: '', workout_description: '' });
  
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [newProgress, setNewProgress] = useState({ member_id: '', weight: '', reps: '', workout_time: '' });

  useEffect(() => {
    Promise.all([
      fetchApi('/schedule'),
      fetchApi('/workouts'),
      fetchApi('/progress'),
      fetchApi('/users')
    ]).then(([schedulesData, workoutsData, progressData, usersData]) => {
      setSchedules(schedulesData);
      setWorkouts(workoutsData);
      setProgress(progressData);
      setMembers(usersData.filter(u => u.role === 'member'));
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching trainer data:", err);
      setLoading(false);
    });
  }, []);

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    try {
      const added = await fetchApi('/workouts', {
        method: 'POST',
        body: JSON.stringify(newWorkout)
      });
      setWorkouts([added, ...workouts]);
      setShowWorkoutForm(false);
      setNewWorkout({ member_id: '', workout_description: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRecordProgress = async (e) => {
    e.preventDefault();
    try {
      const added = await fetchApi('/progress', {
        method: 'POST',
        body: JSON.stringify(newProgress)
      });
      setProgress([added, ...progress]);
      setShowProgressForm(false);
      setNewProgress({ member_id: '', weight: '', reps: '', workout_time: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const todaySchedules = schedules
    .filter(s => s.date === todayStr)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    
  const upcomingSchedules = schedules
    .filter(s => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''));

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Trainer Portal</h1>
        <p className="text-lg text-white/60 font-medium">Manage your clients, schedules, and workout plans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Sessions', value: schedules.length, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Sessions Today', value: todaySchedules.length, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Plans Created', value: workouts.length, icon: FileEdit, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-5 rounded-3xl">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
            <div className="text-xs text-white/40 font-bold uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <div className="bg-white/5/50 border border-white/10/80 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Today's Schedule</h2>
            <button onClick={() => onNavigate('schedule')} className="text-sm font-bold text-rose-500 hover:text-rose-400">View Calendar</button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-zinc-500">Loading...</div>
            ) : todaySchedules.length > 0 ? todaySchedules.map((session, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-black/20 backdrop-blur-md rounded-xl border border-white/10">
                <div className="w-20 text-sm font-bold text-rose-500">{session.time}</div>
                <div className="flex-1 border-l border-zinc-800 pl-4">
                  <div className="font-medium">{session.member}</div>
                  <div className="text-sm text-zinc-400">{session.type || 'Training Session'}</div>
                </div>
                <button onClick={() => alert('Session started!')} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200">Start</button>
              </div>
            )) : (
              <div className="text-zinc-500">No sessions scheduled for today.</div>
            )}
          </div>
        </div>

        {/* All Upcoming Sessions */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">All Upcoming Sessions</h2>
            <button onClick={() => onNavigate('schedule')} className="text-sm font-bold text-rose-500 hover:text-rose-400">Manage</button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-zinc-500">Loading...</div>
            ) : upcomingSchedules.length > 0 ? 
              upcomingSchedules.slice(0, 4).map((session, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-black/20 backdrop-blur-md rounded-xl border border-white/10/50">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <div className="font-medium">{session.member}</div>
                  <div className="text-sm text-white/80 mt-1">{session.type || 'Training Session'}</div>
                  <div className="text-xs text-zinc-500 mt-2">
                    {new Date(session.date.split('-')[0], session.date.split('-')[1] - 1, session.date.split('-')[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {session.time}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-zinc-500">No upcoming sessions.</div>
            )}
          </div>
        </div>

        {/* Workout Plans */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Workout Plans</h2>
            <button onClick={() => setShowWorkoutForm(!showWorkoutForm)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-colors">
              {showWorkoutForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showWorkoutForm ? 'Cancel' : 'Create'}
            </button>
          </div>

          {showWorkoutForm && (
            <form onSubmit={handleCreateWorkout} className="mb-6 p-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col gap-4">
              <select required value={newWorkout.member_id} onChange={e => setNewWorkout({...newWorkout, member_id: e.target.value})} className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500">
                <option value="">Select Member</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <textarea placeholder="Workout Description (e.g. 3x10 Squats)" required value={newWorkout.workout_description} onChange={e => setNewWorkout({...newWorkout, workout_description: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500 min-h-[100px]" />
              <button type="submit" className="bg-white text-black font-bold rounded-xl py-2 hover:bg-zinc-200 transition-colors">Assign Plan</button>
            </form>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="text-zinc-500">Loading...</div>
            ) : workouts.length > 0 ? workouts.map((plan, i) => (
              <div key={i} className="p-4 bg-transparent rounded-xl border border-zinc-800/50">
                <div className="font-bold mb-1">Member #{plan.member_id}</div>
                <div className="text-sm text-zinc-400">{plan.workout_description}</div>
                <div className="text-xs text-zinc-500 mt-2">{new Date(plan.created_at).toLocaleDateString()}</div>
              </div>
            )) : (
              <div className="text-zinc-500">No workout plans created.</div>
            )}
          </div>
        </div>

        {/* Member Progress */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Member Progress</h2>
            <button onClick={() => setShowProgressForm(!showProgressForm)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-colors">
              {showProgressForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showProgressForm ? 'Cancel' : 'Record'}
            </button>
          </div>

          {showProgressForm && (
            <form onSubmit={handleRecordProgress} className="mb-6 p-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <select required value={newProgress.member_id} onChange={e => setNewProgress({...newProgress, member_id: e.target.value})} className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500">
                <option value="">Select Member</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input type="number" step="0.1" placeholder="Weight (kg)" required value={newProgress.weight} onChange={e => setNewProgress({...newProgress, weight: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
              <input type="number" placeholder="Reps" required value={newProgress.reps} onChange={e => setNewProgress({...newProgress, reps: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
              <input type="number" placeholder="Workout Time (minutes)" required value={newProgress.workout_time} onChange={e => setNewProgress({...newProgress, workout_time: e.target.value})} className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
              <button type="submit" className="md:col-span-2 bg-white text-black font-bold rounded-xl py-2 hover:bg-zinc-200 transition-colors">Save Progress</button>
            </form>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="text-zinc-500">Loading...</div>
            ) : progress.length > 0 ? progress.map((prog, i) => (
              <div key={i} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/50">
                <div className="font-bold mb-1">Member #{prog.member_id}</div>
                <div className="flex gap-4 text-sm text-zinc-300 mb-2">
                  <span>Weight: {prog.weight}kg</span>
                  <span>Reps: {prog.reps}</span>
                </div>
                <div className="text-sm text-zinc-400">Workout Time: {prog.workout_time} mins</div>
                <div className="text-xs text-zinc-500 mt-2">{new Date(prog.recorded_at).toLocaleDateString()}</div>
              </div>
            )) : (
              <div className="text-zinc-500">No progress recorded.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
