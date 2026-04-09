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
  ChevronRight
} from 'lucide-react';

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

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  async function fetchLedger() {
    setLoading(true);
    try {
      const res = await fetch(`/api/transaction-ledger?start_date=${startDate}&end_date=${endDate}`);
      const data = await res.json();
      setTransactions(data);
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transaction Ledger</h1>
          <p className="text-slate-500 font-medium mt-1">Detailed audit trail of all financial movements.</p>
        </div>
        <a 
          href={`/api/pdf/ledger?start_date=${startDate}&end_date=${endDate}`}
          target="_blank"
          className="flex items-center space-x-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-500/20"
        >
          <FileDown className="w-5 h-5" />
          <span>Download PDF</span>
        </a>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-slate-50 bg-slate-50/[0.03]">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Start Date</label>
                <div className="relative group">
                  <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input spellCheck={false} 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm font-bold transition-all outline-none shadow-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">End Date</label>
                <div className="relative group">
                  <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input spellCheck={false} 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm font-bold transition-all outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={fetchLedger}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 flex items-center justify-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Apply Filter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-4">Generating Ledger...</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Timestamp</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Member / Account</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Description</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((t) => (
                    <tr key={t.transaction_id} className="hover:bg-slate-50/50 transition-colors group">
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
                          <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Acc: #{t.account_number}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs text-slate-500 font-medium italic">{t.description || 'No description provided'}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end">
                           <span className={cn(
                             "text-lg font-black tracking-tight flex items-center",
                             t.transaction_type === 'Deposit' ? "text-emerald-600" : "text-rose-600"
                           )}>
                             {t.transaction_type === 'Deposit' ? '+' : '-'} {formatCurrency(t.amount)}
                           </span>
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest mt-1 px-2 py-0.5 rounded-lg",
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

              {transactions.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center text-center px-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <History className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 underline decoration-slate-200 decoration-2 underline-offset-4">Empty Ledger</h3>
                  <p className="text-slate-400 text-sm max-w-xs mt-2 font-medium">No transactions were found within the selected date range. Try adjusting your filter.</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/10 flex items-center justify-between">
           <div className="flex items-center space-x-4">
             <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95 disabled:opacity-20">
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95 disabled:opacity-20">
               <ChevronRight className="w-5 h-5" />
             </button>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
             Accounting period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
           </p>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
