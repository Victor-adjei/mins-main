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
  Edit2,
  Trash2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useSession } from 'next-auth/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Transaction {
  transaction_id: number;
  transaction_date: string;
  account_number: string;
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

interface ChartData {
  date: string;
  deposits: number;
  withdrawals: number;
}

export default function LedgerPage() {
  const [data, setData] = useState<{
    transactions: Transaction[];
    summary: SummaryStats;
    chartData: ChartData[];
  } | null>(null);
  
  const { data: session } = useSession();
  const isFieldOfficer = session?.user?.role === 'Field Officer';

  // Modals state
  const [editTransaction, setEditTransaction] = useState<any | null>(null);
  const [voidTransaction, setVoidTransaction] = useState<any | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Default to current month range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  async function fetchLedger() {
    setLoading(true);
    try {
      const res = await fetch(`/api/transaction-ledger?start_date=${startDate}&end_date=${endDate}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        console.error('Ledger API Error:', json.error);
        setData(null);
      }
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
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Transaction Ledger</h1>
          <p className="text-slate-500 font-medium mt-1">Detailed audit trail and cash flow analysis.</p>
        </div>
        <a 
          href={`/api/pdf/ledger?start_date=${startDate}&end_date=${endDate}`}
          target="_blank"
          className="flex items-center space-x-2 px-6 py-3 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all active:scale-95 shadow-xl shadow-rose-500/20"
        >
          <FileDown className="w-5 h-5" />
          <span>Print Report</span>
        </a>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-end gap-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Reporting From</label>
            <div className="relative group">
              <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-sm font-bold outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Reporting To</label>
            <div className="relative group">
              <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-sm font-bold outline-none transition-all"
              />
            </div>
          </div>
        </div>
        <button 
          onClick={fetchLedger}
          disabled={loading}
          className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 opacity-80">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Deposits</span>
            </div>
            <h2 className="text-3xl font-black mt-3 flex items-baseline">
              <span className="text-lg mr-1 opacity-70">GHS</span>
              {data?.summary?.totalDeposits?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </h2>
          </div>
          <ArrowDownLeft className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-500/20 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 opacity-80">
              <TrendingDown className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Withdrawals</span>
            </div>
            <h2 className="text-3xl font-black mt-3 flex items-baseline">
              <span className="text-lg mr-1 opacity-70">GHS</span>
              {data?.summary?.totalWithdrawals?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </h2>
          </div>
          <ArrowUpRight className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>

        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 opacity-80">
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Net Cash Flow</span>
            </div>
            <h2 className="text-3xl font-black mt-3 flex items-baseline">
              <span className="text-lg mr-1 opacity-70">GHS</span>
              {data?.summary?.netCashFlow?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </h2>
          </div>
          <History className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center">
              <TrendingUp className="w-5 h-5 mr-3 text-emerald-500" />
              Daily Trend
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Transaction volume by date</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-black text-slate-400 uppercase">Deposits</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full" />
              <span className="text-[10px] font-black text-slate-400 uppercase">Withdrawals</span>
            </div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          {data && data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(val) => `₵${val}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '1rem', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="deposits" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="withdrawals" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <TrendingUp className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm font-bold opacity-50 uppercase tracking-widest">No chart data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Ledger Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Movement Details</h3>
          <span className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            {data?.transactions.length || 0} Transactions Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5 border-b border-slate-50">Timestamp</th>
                <th className="px-8 py-5 border-b border-slate-50">Member / Account</th>
                <th className="px-8 py-5 border-b border-slate-50 text-right">Flow</th>
                <th className="px-8 py-5 border-b border-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.transactions.map((t) => (
                <tr key={t.transaction_id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-900 leading-none mb-1.5">
                        {new Date(t.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(t.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-slate-900 leading-none mb-1.5">{t.first_name} {t.surname}</p>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter flex items-center">
                        <Wallet className="w-3 h-3 mr-1" />
                        Acc: #{t.account_number}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-lg font-black tracking-tight",
                        t.transaction_type === 'Deposit' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {t.transaction_type === 'Deposit' ? '+' : '-'} {formatCurrency(t.amount)}
                      </span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest mt-1 px-3 py-1 rounded-full",
                        t.transaction_type === 'Deposit' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {t.transaction_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {(!isFieldOfficer || (new Date().getTime() - new Date(t.transaction_date).getTime() < 12 * 60 * 60 * 1000)) ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => {
                            setEditTransaction(t);
                            setEditAmount(t.amount);
                            setEditDescription(t.description || '');
                          }}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setVoidTransaction(t)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end">
                        <Clock className="w-4 h-4 text-slate-200" title="Locked (12h passed)" />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.transactions.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                <History className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Empty Ledger</h3>
              <p className="text-slate-400 text-sm max-w-xs mt-2 font-medium">No transactions were found within the selected date range.</p>
            </div>
          )}
        </div>
      </div>

      {/* Void Confirmation Modal */}
      {voidTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Void Transaction?</h3>
            <p className="text-slate-500 font-medium mt-2 leading-relaxed">
              This will reverse the amount of <span className="font-bold text-rose-600">GHS {parseFloat(voidTransaction.amount).toLocaleString()}</span> from A/C #{voidTransaction.account_number}.
            </p>
            
            <div className="mt-8 space-y-4">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cancellation Reason</label>
              <textarea 
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Why is this being removed? (Required)"
                className="w-full px-5 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-rose-500/20 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all h-24"
              />
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setVoidTransaction(null); setVoidReason(''); }}
                className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={!voidReason || modalLoading}
                onClick={async () => {
                  setModalLoading(true);
                  try {
                    const res = await fetch(`/api/transactions/${voidTransaction.transaction_id}`, {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ reason: voidReason })
                    });
                    if (res.ok) {
                      setVoidTransaction(null);
                      setVoidReason('');
                      fetchLedger();
                    } else {
                      const d = await res.json();
                      alert(d.error || 'Failed to void');
                    }
                  } catch (e) {
                    alert('Network error');
                  } finally {
                    setModalLoading(false);
                  }
                }}
                className="py-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all disabled:opacity-50"
              >
                {modalLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Void"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Edit2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Edit Amount</h3>
            <p className="text-slate-500 font-medium mt-2 leading-relaxed italic">
              Correcting entry for A/C #{editTransaction.account_number}
            </p>
            
            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">New Amount (GHS)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-5 py-5 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-xl font-black text-slate-900 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Updated Description</label>
                <textarea 
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all h-24"
                />
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4">
              <button 
                disabled={modalLoading}
                onClick={async () => {
                  setModalLoading(true);
                  try {
                    const res = await fetch(`/api/transactions/${editTransaction.transaction_id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount: parseFloat(editAmount), description: editDescription })
                    });
                    if (res.ok) {
                      setEditTransaction(null);
                      fetchLedger();
                    } else {
                      const d = await res.json();
                      alert(d.error || 'Failed to update');
                    }
                  } catch (e) {
                    alert('Network error');
                  } finally {
                    setModalLoading(false);
                  }
                }}
                className="py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {modalLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Changes"}
              </button>
              <button 
                onClick={() => setEditTransaction(null)}
                className="py-4 text-slate-400 font-bold hover:text-slate-600 transition-all"
              >
                Close Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
