'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  HandHelping, 
  FileDown,
  Loader2,
  TrendingUp,
  Users
} from 'lucide-react';

interface FinancialStats {
  totalCustomers: number;
  totalAccounts: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalLoans: number;
}

interface AccountItem {
  account_number: number;
  first_name: string;
  surname: string;
  balance: string;
}

export default function FinancialSummaryPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/financial-summary');
        const data = await res.json();
        setStats(data.summary);
        setAccounts(data.accounts);
      } catch (error) {
        console.error('Error fetching financial summary:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Summary</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time overview of the organization's financial health.</p>
        </div>
        <button className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
          <FileDown className="w-5 h-5" />
          <span>Export Reports</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Total Deposits</p>
          <h2 className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(stats?.totalDeposits || 0)}</h2>
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <ArrowUpCircle className="w-16 h-16 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Total Withdrawals</p>
          <h2 className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(stats?.totalWithdrawals || 0)}</h2>
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <ArrowDownCircle className="w-16 h-16 text-rose-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
            <HandHelping className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Total Loans</p>
          <h2 className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(stats?.totalLoans || 0)}</h2>
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Wallet className="w-16 h-16 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Total Customers</p>
          <h2 className="text-2xl font-black text-slate-900 mt-2">{stats?.totalCustomers || 0} Member(s)</h2>
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Users className="w-16 h-16 text-indigo-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-xl font-bold text-slate-900">Highest Balance Accounts</h3>
          <p className="text-sm text-slate-400 font-medium mt-1">Ranking of members by their current savings.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Rank</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Account #</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Member Name</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {accounts.map((acc, index) => (
                <tr key={acc.account_number} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                      index === 0 ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : 
                      index === 1 ? "bg-slate-300 text-slate-700 shadow-sm" :
                      index === 2 ? "bg-orange-300 text-orange-900 shadow-sm" :
                      "bg-slate-100 text-slate-500"
                    )}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-600">#{acc.account_number}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-900 underline decoration-emerald-200 decoration-2 underline-offset-4">{acc.first_name} {acc.surname}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-lg font-black text-emerald-600">{formatCurrency(parseFloat(acc.balance))}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-center">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">End of Ranking List</p>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
