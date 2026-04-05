import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Calendar, Save, X } from 'lucide-react';
import { fetchApi } from '../utils/api';

export default function Profile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    dob: user.dob || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = await fetchApi('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      // Update local storage and reload to reflect changes globally
      const currentUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));
      window.location.reload();
    } catch (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-8"
      >
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-800">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-rose-500">
              <User className="w-10 h-10 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{user.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-xs font-bold uppercase tracking-wider rounded-md">
                  {user.role}
                </span>
                {user.role === 'trainer' && user.specialization && (
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider rounded-md">
                    {user.specialization}
                  </span>
                )}
              </div>
            </div>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors">
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="p-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-colors">
                <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
              <div className="flex items-center gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <User className="w-5 h-5 text-zinc-400" />
                {isEditing ? (
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-transparent border-none outline-none w-full text-white" />
                ) : (
                  <span className="font-medium">{user.name}</span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
              <div className="flex items-center gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <Mail className="w-5 h-5 text-zinc-400" />
                {isEditing ? (
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-transparent border-none outline-none w-full text-white" />
                ) : (
                  <span className="font-medium">{user.email}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Phone Number</label>
              <div className="flex items-center gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <Phone className="w-5 h-5 text-zinc-400" />
                {isEditing ? (
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-transparent border-none outline-none w-full text-white" />
                ) : (
                  <span className="font-medium">{user.phone}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Date of Birth</label>
              <div className="flex items-center gap-3 p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <Calendar className="w-5 h-5 text-zinc-400" />
                {isEditing ? (
                  <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="bg-transparent border-none outline-none w-full text-white" />
                ) : (
                  <span className="font-medium">{user.dob}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
