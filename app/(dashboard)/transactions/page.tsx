'use client';

import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Search,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Account {
  account_number: string;
  first_name: string;
  surname: string;
  balance: string | number;
}

export default function TransactionsPage() {
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Deposit' | 'Withdrawal'>('Deposit');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [fetchingAccount, setFetchingAccount] = useState(false);
  const [selectedAccountDetails, setSelectedAccountDetails] = useState<Account | null>(null);
  const { data: session } = useSession();
  const isFieldOfficer = session?.user?.role === 'Field Officer';

  useEffect(() => {
    if (isFieldOfficer) {
      setType('Deposit');
    }
  }, [isFieldOfficer]);

  useEffect(() => {
    if (accountNumber.length === 10) {
      handleLookup(accountNumber);
    } else {
      setSelectedAccountDetails(null);
    }
  }, [accountNumber]);

  async function handleLookup(accNum: string) {
    setFetchingAccount(true);
    try {
      const res = await fetch(`/api/accounts?accountNumber=${accNum}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSelectedAccountDetails(data[0]);
        setMessage(null);
      } else {
        setSelectedAccountDetails(null);
        setMessage({ type: 'error', text: 'Account not found' });
      }
    } catch (error) {
      console.error('Lookup error:', error);
    } finally {
      setFetchingAccount(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_number: accountNumber,
          transaction_type: type,
          amount: parseFloat(amount),
          description
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Transaction completed! New balance: GHS ${data.newBalance.toLocaleString()}` });
        setAccountNumber('');
        setAmount('');
        setDescription('');
        setSelectedAccountDetails(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Transaction failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Removed unnecessary dataLoading as we use on-demand fetch
  // if (dataLoading) ...


  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transactions</h1>
        <p className="text-slate-500 font-medium mt-1">Process deposits and withdrawals securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
              <Plus className="w-5 h-5 mr-3 text-emerald-500" />
              New Transaction
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div className={cn(
                  "p-4 rounded-2xl border flex items-center space-x-3 mb-6",
                  message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
                )}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  <span className="text-sm font-bold">{message.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-3 italic">Customer Account Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="Enter 10-digit A/C Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      required
                      className="w-full px-5 py-5 bg-[#f0f9ff] border-2 border-slate-300 focus:bg-white focus:ring-4 focus:ring-[#0066cc]/10 focus:border-[#0066cc] rounded-2xl text-xl font-black tracking-widest text-[#0b1424] transition-all outline-none"
                    />
                    {fetchingAccount && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Transaction Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setType('Deposit')}
                      className={cn(
                        "py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all",
                        type === 'Deposit' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Deposit</span>
                    </button>
                    <button
                      type="button"
                      disabled={isFieldOfficer}
                      onClick={() => setType('Withdrawal')}
                      className={cn(
                        "py-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all",
                        type === 'Withdrawal' ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "bg-slate-50 text-slate-400 hover:bg-slate-100",
                        isFieldOfficer && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Amount (GHS)</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">GH₵</div>
                  <input spellCheck={false}
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-16 pr-5 py-5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-2xl font-black transition-all outline-none text-slate-900"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm font-bold transition-all outline-none h-24 text-slate-900"
                  placeholder="What is this transaction for?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full py-5 rounded-2xl text-white font-black text-lg transition-all active:scale-95 shadow-2xl flex items-center justify-center space-x-3",
                  type === 'Deposit' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20",
                  loading && "opacity-70 pointer-events-none"
                )}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span>Process {type}</span>
                    <ArrowUpRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <h3 className="text-lg font-bold mb-6 flex items-center relative z-10">
              <Search className="w-5 h-5 mr-3 text-emerald-400" />
              Account Snapshot
            </h3>

            {selectedAccountDetails ? (
              <div className="relative z-10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Current Balance</p>
                <p className="text-4xl font-black tracking-tighter mb-6">
                  ₵{Number(selectedAccountDetails.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Member</span>
                    <span className="text-sm font-bold">{selectedAccountDetails.first_name} {selectedAccountDetails.surname}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-800">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Account ID</span>
                    <span className="text-sm font-bold text-emerald-400">#{selectedAccountDetails.account_number}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 relative z-10">
                <p className="text-slate-500 text-sm font-medium">Select an account from the form to view real-time balance data.</p>
              </div>
            )}

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 text-amber-500" />
              Guidelines
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Always verify the customer name before submitting the transaction.</p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">For withdrawals, Ensure the balance is sufficient for the amount requested.</p>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Transaction records are permanent and cannot be deleted by field officers.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

