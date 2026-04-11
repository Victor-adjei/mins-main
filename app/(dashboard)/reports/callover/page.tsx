'use client';

import { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  FileDown, 
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Wallet,
  Activity
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Transaction {
  transaction_id: number;
  transaction_date: string;
  account_number: number;
  transaction_type: 'Deposit' | 'Withdrawal';
  amount: string;
  description: string;
  first_name: string;
  surname: string;
}

interface SummaryStats {
  totalDeposits: number;
  totalWithdrawals: number;
  netCashFlow: number;
}

export default function CalloverReportPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<{
    transactions: Transaction[];
    summary: SummaryStats;
  } | null>(null);

  // Default to today for Callover
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  async function fetchLedger() {
    setLoading(true);
    try {
      const res = await fetch(`/api/transaction-ledger?start_date=${startDate}&end_date=${endDate}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching ledger:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  if (loading && !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00c58d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-[#00c58d]/10 rounded-2xl flex items-center justify-center">
                <Activity className="w-8 h-8 text-[#00c58d]" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Callover Report</h1>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Audit trail for officer: <span className="text-[#00c58d]">{session?.user?.name}</span></p>
            </div>
        </div>
        <a 
          href={`/api/pdf/ledger?start_date=${startDate}&end_date=${endDate}`}
          target="_blank"
          className="flex items-center space-x-2 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-slate-800 transition-all active:scale-95 shadow-2xl flex items-center group"
        >
          <FileDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          <span className="uppercase tracking-widest text-xs">Download Audit PDF</span>
        </a>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row lg:items-end gap-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 font-black italic">Start Date</label>
            <div className="relative group">
              <Calendar className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00c58d] transition-colors" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00c58d]/20 focus:bg-white rounded-[1.5rem] text-sm font-bold outline-none transition-all shadow-inner"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 font-black italic">End Date</label>
            <div className="relative group">
              <Calendar className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00c58d] transition-colors" />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-[#00c58d]/20 focus:bg-white rounded-[1.5rem] text-sm font-bold outline-none transition-all shadow-inner"
              />
            </div>
          </div>
        </div>
        <button 
          onClick={fetchLedger}
          disabled={loading}
          className="px-12 py-4 bg-[#00c58d] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-[#00ad7c] transition-all active:scale-95 shadow-xl shadow-[#00c58d]/30 flex items-center justify-center space-x-3 disabled:opacity-50 h-[60px]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
          <span>Verify Records</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 opacity-80">
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Collected (Deposits)</span>
            </div>
            <h2 className="text-4xl font-black mt-4 flex items-baseline">
              <span className="text-xl mr-2 opacity-70 italic font-black">GHS</span>
              {data?.summary.totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-[10px] font-bold text-white/60 mt-4 uppercase tracking-widest">Across {data?.transactions.filter(t => t.transaction_type === 'Deposit').length} unique transactions</p>
          </div>
          <ArrowDownLeft className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 opacity-80">
              <Activity className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Daily Audit Performance</span>
            </div>
            <h2 className="text-4xl font-black mt-4 flex items-baseline">
              {data?.transactions.length}
              <span className="text-xl ml-2 opacity-70 italic font-black uppercase tracking-tight">Entries</span>
            </h2>
            <p className="text-[10px] font-bold text-white/40 mt-4 uppercase tracking-widest">Status: <span className="text-[#00c58d]">Synced With Core</span></p>
          </div>
          <History className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>

      {/* Detailed Ledger Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden shadow-slate-200/20">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Audit Trail</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Chronological list of customer interactions</p>
          </div>
          <span className="bg-[#0b1424] text-[#00c58d] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
            {data?.transactions.length || 0} Records Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <th className="px-10 py-6 border-b border-slate-50">Timestamp</th>
                <th className="px-10 py-6 border-b border-slate-50">Customer / Account</th>
                <th className="px-10 py-6 border-b border-slate-50 text-right">Value (GHS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.transactions.map((t) => (
                <tr key={t.transaction_id} className="hover:bg-[#f0fdf4]/50 transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-[#00c58d]">
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 leading-none mb-2">
                        {new Date(t.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                        {new Date(t.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col">
                      <p className="text-base font-black text-slate-900 leading-none mb-2 uppercase tracking-tight">{t.first_name} {t.surname}</p>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] flex items-center">
                        <Wallet className="w-3 h-3 mr-1.5" />
                        Account: {t.account_number}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-xl font-black tracking-tighter",
                        t.transaction_type === 'Deposit' ? "text-emerald-600 font-black" : "text-rose-600"
                      )}>
                        {t.transaction_type === 'Deposit' ? '+' : '-'} {formatCurrency(t.amount)}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] mt-2 px-4 py-1.5 rounded-full shadow-sm",
                        t.transaction_type === 'Deposit' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {t.transaction_type}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.transactions.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center px-10">
              <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 shadow-inner">
                <History className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase">No Activity Detected</h3>
              <p className="text-slate-400 text-sm max-w-sm mt-3 font-bold uppercase tracking-widest leading-loose italic">Ensure records are synced or adjust your date filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
