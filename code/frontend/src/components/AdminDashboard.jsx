import { useState, useEffect } from 'react';
import { Users, Dumbbell, FileText, Activity, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { fetchApi } from '../utils/api';

export default function AdminDashboard({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');

  // Data States
  const [usersList, setUsersList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [programmesList, setProgrammesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, eqRes, reportsRes, progRes] = await Promise.all([
          fetchApi('/users'),
          fetchApi('/equipment'),
          fetchApi('/reports'),
          fetchApi('/programmes')
        ]);
        
        setUsersList(usersRes);
        setEquipmentList(eqRes);
        setReportsList(reportsRes);
        setProgrammesList(progRes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Form States
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: 'password123', role: 'member', phone: '', dob: '' });

  const [showEqForm, setShowEqForm] = useState(false);
  const [newEq, setNewEq] = useState({ name: '', status: 'Available' });

  const [showProgForm, setShowProgForm] = useState(false);
  const [newProg, setNewProg] = useState({ name: '', capacity: '' });

  // Handlers
  const handleAddProgram = async (e) => {
    e.preventDefault();
    try {
      const addedProg = await fetchApi('/programmes', {
        method: 'POST',
        body: JSON.stringify(newProg)
      });
      setProgrammesList([...programmesList, addedProg]);
      setShowProgForm(false);
      setNewProg({ name: '', capacity: '' });
    } catch (err) {
      alert(err.message);
    }
  };
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const addedUser = await fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });
      setUsersList([...usersList, addedUser]);
      setShowUserForm(false);
      setNewUser({ name: '', email: '', password: 'password123', role: 'member', phone: '', dob: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await fetchApi(`/users/${id}`, { method: 'DELETE' });
      setUsersList(usersList.filter(u => u.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddEq = async (e) => {
    e.preventDefault();
    try {
      const addedEq = await fetchApi('/equipment', {
        method: 'POST',
        body: JSON.stringify(newEq)
      });
      setEquipmentList([...equipmentList, addedEq]);
      setShowEqForm(false);
      setNewEq({ name: '', status: 'Available' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateEqStatus = async (id, newStatus) => {
    try {
      await fetchApi(`/equipment/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      setEquipmentList(equipmentList.map(eq => eq.id === id ? { ...eq, status: newStatus } : eq));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEq = async (id) => {
    try {
      await fetchApi(`/equipment/${id}`, { method: 'DELETE' });
      setEquipmentList(equipmentList.filter(eq => eq.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadReport = (report) => {
    const reportData = `Report ID: ${report.id}\nTitle: ${report.title}\nType: ${report.type}\nDate: ${report.date}\n\nThis is an auto-generated system report.`;
    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_').toLowerCase()}_${report.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = async () => {
    const types = ['Usage', 'Maintenance', 'Financial', 'Progress'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    try {
      const addedReport = await fetchApi('/reports', {
        method: 'POST',
        body: JSON.stringify({ type: randomType })
      });
      setReportsList([addedReport, ...reportsList]);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 text-center text-white/60">Loading dashboard data...</div>;
  }

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: usersList.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Active Trainers', value: usersList.filter(u => u.role === 'trainer').length, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Equipment Issues', value: equipmentList.filter(e => e.status === 'Maintenance').length, icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Reports Generated', value: reportsList.length, icon: FileText, color: 'text-rose-500', bg: 'bg-rose-500/10' },
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
        <div className="bg-white/5/50 border border-white/10/80 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Equipment Status</h2>
            <button onClick={() => setActiveTab('equipment')} className="text-sm font-bold text-rose-500 hover:text-rose-400">Manage Inventory</button>
          </div>
          <div className="space-y-4">
            {equipmentList.slice(0, 4).map((eq) => (
              <div key={eq.id} className="flex justify-between items-center p-4 bg-black/20 backdrop-blur-md rounded-xl border border-white/10">
                <span className="font-medium">{eq.name}</span>
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                  eq.status === 'Available' ? 'text-green-500 bg-green-500/10' :
                  eq.status === 'In Use' ? 'text-blue-500 bg-blue-500/10' : 'text-orange-500 bg-orange-500/10'
                }`}>
                  {eq.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Recent Reports</h2>
            <button onClick={() => setActiveTab('reports')} className="text-sm font-bold text-rose-500 hover:text-rose-400">View All</button>
          </div>
          <div className="space-y-4">
            {reportsList.slice(0, 4).map((report) => (
              <div key={report.id} className="flex justify-between items-center p-4 bg-black/20 backdrop-blur-md rounded-xl border border-white/10/50">
                <div>
                  <div className="font-medium">{report.title}</div>
                  <div className="text-sm text-zinc-400">{report.date}</div>
                </div>
                <span className="px-3 py-1 bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wider rounded-md">
                  {report.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderUsers = () => (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Manage Users</h2>
        <button onClick={() => setShowUserForm(!showUserForm)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-colors">
          {showUserForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showUserForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showUserForm && (
        <form onSubmit={handleAddUser} className="mb-8 p-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input type="text" placeholder="Full Name" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
          <input type="email" placeholder="Email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
          <input type="password" placeholder="Password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
          <input type="text" placeholder="Phone Number" required value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
          <input type="date" required value={newUser.dob} onChange={e => setNewUser({...newUser, dob: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
          <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500">
            <option value="member">Member</option>
            <option value="trainer">Trainer</option>
            <option value="admin">Admin</option>
          </select>
          {newUser.role === 'trainer' && (
            <input type="text" placeholder="Specialization (e.g. Yoga)" required value={newUser.specialization || ''} onChange={e => setNewUser({...newUser, specialization: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
          )}
          <button type="submit" className="bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">Save User</button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-sm uppercase tracking-wider">
              <th className="pb-3 font-bold">Name</th>
              <th className="pb-3 font-bold">Email</th>
              <th className="pb-3 font-bold">Role</th>
              <th className="pb-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {usersList.map(u => (
              <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="py-4 font-medium">{u.name}</td>
                <td className="py-4 text-zinc-400">{u.email}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
                    u.role === 'admin' ? 'bg-rose-500/10 text-rose-500' :
                    u.role === 'trainer' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-800 text-zinc-300'
                  }`}>{u.role}</span>
                </td>
                <td className="py-4 text-right">
                  <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-zinc-500 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEquipment = () => (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Manage Equipment</h2>
        <button onClick={() => setShowEqForm(!showEqForm)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-colors">
          {showEqForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showEqForm ? 'Cancel' : 'Add Equipment'}
        </button>
      </div>

      {showEqForm && (
        <form onSubmit={handleAddEq} className="mb-8 p-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="Equipment Name" required value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
          <select value={newEq.status} onChange={e => setNewEq({...newEq, status: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500">
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <button type="submit" className="bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">Save Equipment</button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-sm uppercase tracking-wider">
              <th className="pb-3 font-bold">Equipment Name</th>
              <th className="pb-3 font-bold">Status</th>
              <th className="pb-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {equipmentList.map(eq => (
              <tr key={eq.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="py-4 font-medium">{eq.name}</td>
                <td className="py-4">
                  <select 
                    value={eq.status} 
                    onChange={(e) => handleUpdateEqStatus(eq.id, e.target.value)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md appearance-none cursor-pointer outline-none ${
                      eq.status === 'Available' ? 'text-green-500 bg-green-500/10 border border-green-500/20' :
                      eq.status === 'In Use' ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20' : 'text-orange-500 bg-orange-500/10 border border-orange-500/20'
                    }`}
                  >
                    <option value="Available" className="bg-zinc-900 text-white">Available</option>
                    <option value="In Use" className="bg-zinc-900 text-white">In Use</option>
                    <option value="Maintenance" className="bg-zinc-900 text-white">Maintenance</option>
                  </select>
                </td>
                <td className="py-4 text-right">
                  <button onClick={() => handleDeleteEq(eq.id)} className="p-2 text-zinc-500 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">System Reports</h2>
        <button onClick={handleGenerateReport} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">
          <FileText className="w-5 h-5" /> Generate New Report
        </button>
      </div>

      <div className="space-y-4">
        {reportsList.map((report) => (
          <div key={report.id} className="flex justify-between items-center p-5 bg-transparent rounded-xl border border-zinc-800/50 hover:border-white/20 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <FileText className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <div className="font-bold text-lg">{report.title}</div>
                <div className="text-sm text-zinc-400">Generated on {report.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-md hidden sm:block">
                {report.type}
              </span>
              <button onClick={() => handleDownloadReport(report)} className="text-sm font-bold text-rose-500 hover:text-rose-400">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProgrammes = () => (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Manage Programmes</h2>
        <button onClick={() => setShowProgForm(!showProgForm)} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-colors">
          {showProgForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showProgForm ? 'Cancel' : 'Add Programme'}
        </button>
      </div>

      {showProgForm && (
        <form onSubmit={handleAddProgram} className="mb-8 p-6 bg-zinc-950 border border-zinc-800 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Programme Name" required value={newProg.name} onChange={e => setNewProg({...newProg, name: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
          <input type="number" placeholder="Capacity (e.g. 20)" required value={newProg.capacity} onChange={e => setNewProg({...newProg, capacity: e.target.value})} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-rose-500" />
          <button type="submit" className="md:col-span-2 bg-white text-black font-bold rounded-xl py-2 hover:bg-zinc-200 transition-colors">Save Programme</button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-sm uppercase tracking-wider">
              <th className="pb-3 font-bold">Programme Name</th>
              <th className="pb-3 font-bold">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {programmesList.map(prog => (
              <tr key={prog.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="py-4 font-medium">{prog.name}</td>
                <td className="py-4 text-zinc-400">{prog.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Admin Portal</h1>
        <p className="text-lg text-zinc-400 font-medium">Manage facility resources, users, and reports.</p>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
        {['overview', 'users', 'equipment', 'reports', 'programmes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-bold text-sm capitalize whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-white text-black' : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Render Active Tab */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'equipment' && renderEquipment()}
      {activeTab === 'reports' && renderReports()}
      {activeTab === 'programmes' && renderProgrammes()}

    </div>
  );
}
