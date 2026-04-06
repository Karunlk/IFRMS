import { useState, useEffect } from 'react';
import { Activity, Calendar, Clock, Flame, TrendingUp, Dumbbell, User, ChevronRight, FileText, CheckCircle } from 'lucide-react';
import { fetchApi } from '../utils/api';

export default function MemberDashboard({ user, onNavigate }) {
  const [schedules, setSchedules] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi('/schedule'),
      fetchApi('/programmes'),
      fetchApi('/workouts'),
      fetchApi('/progress')
    ]).then(([schedulesData, programmesData, workoutsData, progressData]) => {
      setSchedules(schedulesData);
      setProgrammes(programmesData);
      setWorkouts(workoutsData);
      setProgress(progressData);
      setLoading(false);
    }).catch(err => {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    });
  }, []);

  const handleEnrol = async (programmeId) => {
    try {
      await fetchApi('/programmes/enrol', {
        method: 'POST',
        body: JSON.stringify({ programme_id: programmeId })
      });
      alert('Successfully enrolled!');
    } catch (err) {
      alert(err.message);
    }
  };

  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const upcomingSchedules = schedules
    .filter(s => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
    .slice(0, 3);

  const activeHours = (progress.reduce((acc, curr) => acc + (Number(curr.workout_time) || 0), 0) / 60).toFixed(1);

const formatDate = (dateString) => {
  if (!dateString) return "—";
  
  const date = new Date(dateString);

  return date.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
};
  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-lg text-white/60 font-medium">Here's your fitness overview for today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Sessions', value: schedules.length, icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Upcoming', value: upcomingSchedules.length, icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
              { label: 'Active Hrs', value: activeHours, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Streak', value: 'Active', icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' },
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

          {/* Assigned Workout Plans */}
          <div className="bg-white/5/50 border border-white/10/80 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Assigned Workout Plans</h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-zinc-500">Loading plans...</div>
              ) : workouts.length > 0 ? workouts.map((plan, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-blue-500/20 text-blue-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Plan from Trainer #{plan.trainer_id}</div>
                      <div className="text-sm text-zinc-400 font-medium">{plan.workout_description || plan.plan_details}</div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-zinc-500">No workout plans assigned yet.</div>
              )}
            </div>
          </div>

          {/* Fitness Progress */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Fitness Progress</h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-zinc-500">Loading progress...</div>
              ) : progress.length > 0 ? progress.map((prog, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-transparent rounded-2xl border border-zinc-800/50 gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-green-500/20 text-green-500">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">Weight: {prog.weight}kg | Reps: {prog.reps}</div>
                      <div className="text-sm text-zinc-400 font-medium">Workout Time: {prog.workout_time} mins</div>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-500">{new Date(prog.recorded_at).toLocaleDateString()}</div>
                </div>
              )) : (
                <div className="text-zinc-500">No progress recorded yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Programmes */}
        <div className="space-y-8">
          {/* Upcoming Schedule */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-rose-500" /> Upcoming Sessions
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-zinc-500">Loading...</div>
              ) : upcomingSchedules.length > 0 ? upcomingSchedules.map((session, i) => (
                <div key={i} className="p-5 border border-zinc-800 rounded-2xl bg-zinc-950 relative overflow-hidden group cursor-pointer hover:border-white/20 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />
                  <div className="text-sm text-rose-500 font-bold mb-2 uppercase tracking-wider">
                    {new Date(session.date.split('-')[0], session.date.split('-')[1] - 1, session.date.split('-')[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="font-bold text-xl mb-2">{session.type || 'Training Session'}</div>
                  <div className="text-sm text-zinc-400 flex items-center gap-2 font-medium">
                    <User className="w-4 h-4" /> Trainer: {session.trainer}
                  </div>
                </div>
              )) : (
                <div className="text-zinc-500">No upcoming sessions.</div>
              )}
            </div>
            <button onClick={() => onNavigate('schedule')} className="w-full mt-6 py-4 border border-zinc-700 rounded-2xl text-sm font-bold hover:bg-white/10 transition-colors">
              Book New Session
            </button>
          </div>

          {/* Fitness Programmes */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Available Programmes</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-zinc-500">Loading...</div>
              ) : programmes.length > 0 ? programmes.map((prog, i) => (
                <div key={i} className="flex flex-col p-4 bg-black/20 backdrop-blur-md rounded-xl border border-white/10">
                  <span className="text-zinc-200 font-bold text-lg">{prog.name}</span>
                  <span className="text-zinc-400 text-sm mb-3">Capacity: {prog.capacity || prog.description}</span>
                  <button onClick={() => handleEnrol(prog.id)} className="px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-500 transition-colors self-start">
                    Enrol Now
                  </button>
                </div>
              )) : (
                <div className="text-zinc-500">No programmes available.</div>
              )}
            </div>
          </div>
          
          {/* Membership Details */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Membership Details</h2>
            <div className="p-4 bg-black/20 backdrop-blur-md rounded-xl border border-white/10/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400">Status</span>
                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-wider rounded-md">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Member Since</span>
                      <span className="text-zinc-200 font-medium">
  {formatDate(user?.membership_date)}
</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
