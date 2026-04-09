'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Mail, 
  User, 
  MoreVertical, 
  Loader2,
  Lock,
  Search,
  CheckCircle2
} from 'lucide-react';

interface UserRecord {
  user_number: number;
  username: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New User Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Staff');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });

      if (res.ok) {
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('Staff');
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Users</h1>
        <p className="text-slate-500 font-medium mt-1">Manage staff access and roles for the MIMS platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <UserPlus className="w-5 h-5 mr-3 text-emerald-500" />
              Add System User
            </h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm font-bold transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm font-bold transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Temporary Password</label>
                <div className="relative">
                   <Lock className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                     type="password" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm font-bold transition-all outline-none" 
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">System Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm font-bold transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Field Officer">Field Officer</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl shadow-slate-200 mt-6 flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Create User</span>
                    <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
               <h3 className="text-lg font-bold text-slate-900 flex items-center">
                 <User className="w-5 h-5 mr-3 text-emerald-500" />
                 Active Directory
               </h3>
               <div className="relative w-64">
                 <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                    type="text" 
                    placeholder="Quick search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500/10 outline-none"
                 />
               </div>
            </div>

            <div className="divide-y divide-slate-50">
              {filteredUsers.map((u) => (
                <div key={u.user_number} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center space-x-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg border border-emerald-100 shadow-sm">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none">{u.username}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          <Mail className="w-3 h-3 mr-1 text-slate-300" />
                          {u.email}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          u.role === 'Admin' ? "bg-rose-50 text-rose-600 border-rose-100" :
                          u.role === 'Staff' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {u.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleDeleteUser(u.user_number)}
                      title="Revoke Access" 
                      className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="py-24 text-center px-8">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching system users found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
