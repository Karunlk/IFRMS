import { useState, useEffect } from 'react';
import { Activity, Calendar, Clock, Flame, TrendingUp, Dumbbell, User, ChevronRight, FileText, CheckCircle, CreditCard, Calculator, AlertCircle } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function MemberDashboard({ user, onNavigate }) {
  const [schedules, setSchedules] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bmiData, setBmiData] = useState({ height: '', weight: '' });
  const [bmiResult, setBmiResult] = useState(null);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      fetchApi('/schedule'),
      fetchApi('/programmes'),
      fetchApi('/workouts'),
      fetchApi('/progress'),
      fetchApi('/payments/history'),
    ]).then(([schedulesData, programmesData, workoutsData, progressData, paymentsData]) => {
      setSchedules(schedulesData);
      setProgrammes(programmesData);
      setWorkouts(workoutsData);
      setProgress(progressData);
      setPayments(paymentsData || []);
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
      toast.success('Successfully enrolled in programme!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const calcBmi = () => {
    const h = parseFloat(bmiData.height) / 100; // cm to m
    const w = parseFloat(bmiData.weight);
    if (!h || !w || h <= 0 || w <= 0) { toast.error('Please enter valid height and weight.'); return; }
    const bmi = (w / (h * h)).toFixed(1);
    let category = '', color = '';
    if (bmi < 18.5) { category = 'Underweight'; color = 'text-blue-400'; }
    else if (bmi < 25) { category = 'Normal weight'; color = 'text-green-400'; }
    else if (bmi < 30) { category = 'Overweight'; color = 'text-yellow-400'; }
    else { category = 'Obese'; color = 'text-red-400'; }
    setBmiResult({ bmi, category, color });
  };

  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const upcomingSchedules = schedules
    .filter(s => s.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
    .slice(0, 3);

  const activeHours = (progress.reduce((acc, curr) => acc + (Number(curr.workout_time) || 0), 0) / 60).toFixed(1);

  const membershipExpiry = user?.membership_expiry_date ? new Date(user.membership_expiry_date) : null;
  const isExpired = membershipExpiry && membershipExpiry < new Date();
  const daysUntilExpiry = membershipExpiry ? Math.ceil((membershipExpiry - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="pt-20 sm:pt-28 pb-24 md:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-base sm:text-lg text-white/60 font-medium">Here's your fitness overview for today.</p>
      </div>

      {/* Membership Expiry Warning */}
      {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
        <div className={`mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border ${isExpired ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
          <div className="flex items-center gap-3">
            <AlertCircle className={`w-5 h-5 shrink-0 ${isExpired ? 'text-red-500' : 'text-yellow-500'}`} />
            <div>
              <p className="font-bold text-sm">{isExpired ? 'Membership Expired' : `Membership expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{isExpired ? 'Renew now to regain access to all features.' : 'Renew your membership to continue enjoying all benefits.'}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('payment')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shrink-0 ${isExpired ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}
          >
            Renew Now
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Stats & Progress */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total Sessions', value: schedules.length, icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Upcoming', value: upcomingSchedules.length, icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
              { label: 'Active Hrs', value: activeHours, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Progress', value: progress.length, icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-4 sm:p-5 rounded-3xl">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-3 sm:mb-4`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold mb-1">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Assigned Workout Plans */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Assigned Workout Plans</h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-zinc-500">Loading plans...</div>
              ) : workouts.length > 0 ? workouts.map((plan, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 bg-blue-500/20 text-blue-500">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-base sm:text-lg">Plan from Trainer #{plan.trainer_id}</div>
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
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Fitness Progress</h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-zinc-500">Loading progress...</div>
              ) : progress.length > 0 ? progress.map((prog, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-transparent rounded-2xl border border-zinc-800/50 gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-green-500/20 text-green-500">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">Weight: {prog.weight}kg &nbsp;|&nbsp; Reps: {prog.reps}</div>
                      <div className="text-sm text-zinc-400">Workout Time: {prog.workout_time} mins</div>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-500">{new Date(prog.progress_date || prog.recorded_at).toLocaleDateString()}</div>
                </div>
              )) : (
                <div className="text-zinc-500">No progress recorded yet.</div>
              )}
            </div>
          </div>

          {/* BMI Calculator */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-6 flex items-center gap-3">
              <Calculator className="w-5 h-5 text-blue-500" /> BMI Calculator
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 175"
                  value={bmiData.height}
                  onChange={e => setBmiData({ ...bmiData, height: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={bmiData.weight}
                  onChange={e => setBmiData({ ...bmiData, weight: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <button onClick={calcBmi} className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
              Calculate BMI
            </button>
            {bmiResult && (
              <div className="mt-4 p-4 bg-black/20 rounded-2xl border border-white/10 flex items-center gap-4">
                <div className="text-4xl font-extrabold text-white">{bmiResult.bmi}</div>
                <div>
                  <p className={`font-bold ${bmiResult.color}`}>{bmiResult.category}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Body Mass Index</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:space-y-8">
          {/* Upcoming Schedule */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-rose-500" /> Upcoming Sessions
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-zinc-500">Loading...</div>
              ) : upcomingSchedules.length > 0 ? upcomingSchedules.map((session, i) => (
                <div key={i} className="p-4 border border-zinc-800 rounded-2xl bg-zinc-950 relative overflow-hidden group cursor-pointer hover:border-white/20 transition-colors">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />
                  <div className="text-sm text-rose-500 font-bold mb-1 uppercase tracking-wider text-xs">
                    {new Date(session.date.split('-')[0], session.date.split('-')[1] - 1, session.date.split('-')[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="font-bold text-base mb-1">{session.type || 'Training Session'}</div>
                  <div className="text-sm text-zinc-400 flex items-center gap-2 font-medium">
                    <User className="w-3.5 h-3.5" /> {session.trainer}
                  </div>
                </div>
              )) : (
                <div className="text-zinc-500">No upcoming sessions.</div>
              )}
              <button onClick={() => onNavigate('schedule')} className="w-full py-3 border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white rounded-2xl text-sm font-bold transition-colors">
                View Full Schedule
              </button>
            </div>
          </div>

          {/* Fitness Programmes */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight mb-6">Available Programmes</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-zinc-500">Loading...</div>
              ) : programmes.length > 0 ? programmes.map((prog, i) => (
                <div key={i} className="flex flex-col p-4 bg-black/20 backdrop-blur-md rounded-xl border border-white/10">
                  <span className="text-zinc-200 font-bold">{prog.name}</span>
                  <span className="text-zinc-400 text-sm mb-3">Capacity: {prog.capacity}</span>
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
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight mb-6">Membership Details</h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/10">
                <span className="text-zinc-400 text-sm">Status</span>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${isExpired ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                  {isExpired ? 'Expired' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/10">
                <span className="text-zinc-400 text-sm">Plan</span>
                <span className="text-zinc-200 font-medium capitalize">{user?.membership_plan || 'Basic'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/10">
                <span className="text-zinc-400 text-sm">Member Since</span>
                <span className="text-zinc-200 font-medium">{formatDate(user?.membership_date)}</span>
              </div>
              {membershipExpiry && (
                <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/10">
                  <span className="text-zinc-400 text-sm">Expires</span>
                  <span className={`font-medium ${isExpired ? 'text-red-400' : daysUntilExpiry <= 7 ? 'text-yellow-400' : 'text-zinc-200'}`}>
                    {formatDate(user?.membership_expiry_date)}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigate('payment')}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <CreditCard className="w-4 h-4" /> Renew Membership
            </button>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-5 sm:p-8">
              <h2 className="text-xl font-bold tracking-tight mb-6">Payment History</h2>
              <div className="space-y-3">
                {payments.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10">
                    <div>
                      <p className="text-sm font-bold capitalize">{p.plan} · {p.months}mo</p>
                      <p className="text-xs text-zinc-500">{new Date(p.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{p.amount}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${p.status === 'succeeded' ? 'bg-green-500/10 text-green-500' : p.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

