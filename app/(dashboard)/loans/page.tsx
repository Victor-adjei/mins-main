'use client';

import { useState, useEffect } from 'react';
import { 
  HandHelping, 
  Search, 
  Plus, 
  Loader2,
  Filter,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  DollarSign
} from 'lucide-react';

interface Loan {
  loan_id: number;
  first_name: string;
  surname: string;
  loan_type_name: string;
  interest_rate: string;
  loan_amount: string;
  payable_amount: string;
  duration_months: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  application_date: string;
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLoans();
  }, []);

  async function fetchLoans() {
    try {
      const res = await fetch('/api/loans');
      const data = await res.json();
      setLoans(data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLoans = loans.filter(l => 
    `${l.first_name} ${l.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.loan_id.toString().includes(searchTerm)
  );

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Loans</h1>
          <p className="text-slate-500 font-medium mt-1">Review loan applications and monitor repayments.</p>
        </div>
        <button className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
          <Plus className="w-5 h-5" />
          <span>Apply for Loan</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md text-center">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search loans by member name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm transition-all outline-none" 
            />
          </div>
          <div className="flex items-center space-x-3">
             <div className="flex bg-slate-50 rounded-xl p-1">
               <button className="px-4 py-1.5 text-xs font-bold text-slate-600 bg-white rounded-lg shadow-sm">All</button>
               <button className="px-4 py-1.5 text-xs font-bold text-slate-400">Pending</button>
               <button className="px-4 py-1.5 text-xs font-bold text-slate-400">Active</button>
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
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Member</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Loan Type</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Financials</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLoans.map((loan) => (
                <tr key={loan.loan_id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {loan.first_name[0]}{loan.surname[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none">{loan.first_name} {loan.surname}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(loan.application_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{loan.loan_type_name}</span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter mt-1">
                        {loan.interest_rate}% Interest
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <Banknote className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-black text-slate-900">{formatCurrency(loan.loan_amount)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-rose-500">Payable: {formatCurrency(loan.payable_amount)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        loan.status === 'Pending' ? "bg-amber-50 text-amber-600 border border-amber-100" :
                        loan.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        loan.status === 'Rejected' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                        "bg-slate-50 text-slate-600 border border-slate-100"
                      )}>
                        {loan.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {loan.status === 'Pending' ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button title="Approve" className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100">
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button title="Reject" className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Actions</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLoans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                <HandHelping className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 underline decoration-emerald-200 decoration-2 underline-offset-4">No loan records</h3>
              <p className="text-slate-400 text-sm max-w-xs mt-2 font-medium">There are currently no loan applications in the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
