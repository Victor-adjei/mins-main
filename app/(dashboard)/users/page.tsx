'use client';

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  MoreVertical,
  Key,
  Trash2,
  Users2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  UserCircle
} from 'lucide-react';

interface User {
  user_number: number;
  username: string;
  email: string;
  role: string;
  phone: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for modals/actions
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Staff',
    phone: ''
  });

  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setUsers(data);
      } else {
        setError(data.error || 'Failed to load users.');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUser = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      });

      if (res.ok) {
        setSuccess(`User ${newUserForm.username} created successfully!`);
        setShowAddModal(false);
        setNewUserForm({ username: '', email: '', password: '', role: 'Staff', phone: '' });
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Creation failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (type: 'role' | 'password') => {
    if (!editingUser) return;
    setSubmitting(true);
    setError(null);

    const body: any = { role: newRole || editingUser.role };
    if (type === 'password') {
      if (!newPassword) {
        setError('Please enter a new password.');
        setSubmitting(false);
        return;
      }
      body.password = newPassword;
    }

    try {
      const res = await fetch(`/api/users/${editingUser.user_number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccess(`User ${editingUser.username} updated successfully!`);
        setShowRoleModal(false);
        setShowPasswordModal(false);
        setNewPassword('');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Update failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('User deleted successfully.');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Delete failed.');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#0b1424] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-[#00c58d]" />
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">MANAGE USERS</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">Administrative Control Center</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#00c58d] text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#00ad7c] transition-all shadow-lg shadow-[#00c58d]/20 flex items-center"
        >
          <UserCircle className="w-4 h-4 mr-2" />
          Add New User
        </button>
      </div>

      <div className="p-6">
        {/* Search Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#00c58d]/10 focus:border-[#00c58d]/50 rounded-xl text-sm transition-all outline-none font-medium"
            />
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center shadow-sm">
            <CheckCircle2 className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm uppercase">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center shadow-sm">
            <AlertCircle className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm uppercase">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">User Profile</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Contact Info</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00c58d]" /></td></tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.user_number} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 leading-none">{user.username}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">ID: {user.user_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-xs text-slate-600 font-bold">
                          <Mail className="w-3 h-3 mr-2 text-slate-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-xs text-slate-600 font-bold uppercase tracking-tight">
                          <Phone className="w-3 h-3 mr-2 text-slate-400" />
                          {user.phone || 'No Mobile'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        user.role === 'Staff' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => { setEditingUser(user); setNewRole(user.role); setShowRoleModal(true); }}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 text-[10px] font-black uppercase rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Change Role
                        </button>
                        <button 
                          onClick={() => { setEditingUser(user); setShowPasswordModal(true); }}
                          className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase rounded-lg hover:bg-amber-100 transition-colors flex items-center"
                        >
                          <Key className="w-3 h-3 mr-1.5" />
                          Reset PW
                        </button>
                        <button 
                          onClick={() => handleDelete(user.user_number)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0b1424] flex items-center justify-center text-white uppercase font-black text-xl">
                {editingUser.username[0]}
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase">Change Role</h3>
            </div>
            
            <p className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-tight">
              Adjusting permissions for <span className="text-slate-900">{editingUser.username}</span>
            </p>

            <select 
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00c58d]/20 outline-none mb-6"
            >
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Field Officer">Field Officer</option>
            </select>

            <div className="flex space-x-3">
              <button 
                onClick={() => setShowRoleModal(false)}
                className="flex-1 py-3 text-sm font-black text-slate-500 uppercase hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpdate('role')}
                disabled={submitting}
                className="flex-1 py-3 bg-[#00c58d] text-white text-sm font-black uppercase rounded-xl hover:bg-[#00ad7c] transition-all shadow-lg shadow-[#00c58d]/20"
              >
                {submitting ? '...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase">Reset Password</h3>
            </div>
            
            <p className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-tight">
              Create a new password for <span className="text-slate-900">{editingUser.username}</span>
            </p>

            <input 
              type="password"
              placeholder="Enter new password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-amber-500/20 outline-none mb-6"
            />

            <div className="flex space-x-3">
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-3 text-sm font-black text-slate-500 uppercase hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpdate('password')}
                disabled={submitting}
                className="flex-1 py-3 bg-amber-500 text-white text-sm font-black uppercase rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
              >
                {submitting ? '...' : 'Reset Now'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#00c58d] flex items-center justify-center text-white">
                <UserCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase">Add New User</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Full Username</label>
                <input 
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({...newUserForm, username: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00c58d]/20 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Email Address</label>
                <input 
                  type="email"
                  placeholder="john@example.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00c58d]/20 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Mobile Number</label>
                <input 
                  type="tel"
                  placeholder="e.g. 0244000000"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({...newUserForm, phone: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00c58d]/20 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Initial Password</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00c58d]/20 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">System Role</label>
                <select 
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#00c58d]/20 outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Field Officer">Field Officer</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 text-sm font-black text-slate-500 uppercase hover:bg-slate-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateUser}
                disabled={submitting}
                className="flex-1 py-3 bg-[#00c58d] text-white text-sm font-black uppercase rounded-xl hover:bg-[#00ad7c] transition-all shadow-lg shadow-[#00c58d]/20"
              >
                {submitting ? '...' : 'Register User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

