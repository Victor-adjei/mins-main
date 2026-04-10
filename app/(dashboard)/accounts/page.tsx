'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Loader2,
  Filter,
  User,
  ShieldCheck,
  MoreVertical,
  Activity
} from 'lucide-react';

interface Account {
  account_number: number;
  first_name: string;
  surname: string;
  account_type_name: string;
  account_status_name: string;
  balance: string;
  created_at: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAccounts(data);
      } else {
        console.error('Failed to fetch accounts:', data);
        setAccounts([]);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAccounts = accounts.filter(a => 
    `${a.first_name} ${a.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.account_number.toString().includes(searchTerm)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Accounts</h1>
          <p className="text-slate-500 font-medium mt-1">Manage member savings and credit accounts.</p>
        </div>
        <button className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
          <Plus className="w-5 h-5" />
          <span>Open Account</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input spellCheck={false} 
              type="text" 
              placeholder="Search accounts by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm transition-all outline-none" 
            />
          </div>
          <div className="flex items-center space-x-3">
             <div className="flex bg-slate-50 rounded-xl p-1">
               <button className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white rounded-lg shadow-sm">All</button>
               <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Active</button>
               <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Closed</button>
             </div>
             <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
               <Filter className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Account Details</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Type / Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Current Balance</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAccounts.map((account) => (
                <tr key={account.account_number} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 flex-shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                          #{account.account_number}
                        </p>
                        <p className="text-xs font-bold text-slate-400 flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {account.first_name} {account.surname}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col space-y-1.5">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                        {account.account_type_name || 'Standard'}
                      </span>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider w-fit",
                        account.account_status_name === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {account.account_status_name || 'Active'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-slate-900 tracking-tighter">
                        ₵{parseFloat(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center mt-1">
                        <Activity className="w-3 h-3 mr-1" />
                        Last Activity: Today
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAccounts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                <CreditCard className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No accounts found</h3>
              <p className="text-slate-400 text-sm max-w-xs mt-2 font-medium">We couldn't find any accounts matching your search. Try searching for a different number or member name.</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             End of account records
           </p>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             Total Records: {accounts.length}
           </p>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
