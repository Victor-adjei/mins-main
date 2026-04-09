'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Loader2,
  Trash2,
  Edit2,
  MoreVertical,
  Banknote,
  CheckCircle2
} from 'lucide-react';

interface AccountType {
  account_type_number: number;
  account_type_name: string;
}

export default function AccountTypesPage() {
  const [types, setTypes] = useState<AccountType[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchTypes();
  }, []);

  async function fetchTypes() {
    setDataLoading(true);
    try {
      const res = await fetch('/api/account-types');
      const data = await res.json();
      setTypes(data);
    } catch (error) {
      console.error('Error fetching account types:', error);
    } finally {
      setDataLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/account-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setName('');
        fetchTypes();
      }
    } catch (error) {
      console.error('Error adding account type:', error);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Types</h1>
        <p className="text-slate-500 font-medium mt-1">Configure the different types of accounts members can open.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Plus className="w-5 h-5 mr-3 text-emerald-500" />
              New Account Type
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Type Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm font-bold transition-all outline-none" 
                  placeholder="e.g. Current, Savings, Fix Deposit"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Create Account Type</span>
                    <Plus className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-8 border-b border-slate-50 bg-slate-50/20">
               <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight flex items-center">
                 <Banknote className="w-5 h-5 mr-3 text-emerald-500" />
                 Active Account Types
               </h3>
            </div>
            
            <div className="divide-y divide-slate-50">
              {types.length > 0 ? types.map((type) => (
                <div key={type.account_type_number} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-sm border border-sky-100">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none">{type.account_type_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">ID: #{type.account_type_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                   <Banknote className="w-12 h-12 text-slate-200 mb-4" />
                   <h4 className="text-sm font-bold text-slate-900">No account types available</h4>
                   <p className="text-xs text-slate-400 font-medium mt-1">Add account types to start registering member accounts.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
