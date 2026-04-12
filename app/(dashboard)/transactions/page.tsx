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
  AlertCircle,
  Edit2,
  Trash2,
  Clock,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Account {
  account_number: string;
  first_name: string;
  surname: string;
  balance: string | number;
}

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Deposit' | 'Withdrawal'>('Deposit');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [fetchingRecent, setFetchingRecent] = useState(false);
  
  // Modals state
  const [editTransaction, setEditTransaction] = useState<any | null>(null);
  const [voidTransaction, setVoidTransaction] = useState<any | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

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
    fetchRecentTransactions();
  }, [activeTab]);

  async function fetchRecentTransactions() {
    setFetchingRecent(true);
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Show 20 items in manage tab, 5 in snapshot
        setRecentTransactions(activeTab === 'manage' ? data : data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent:', error);
    } finally {
      setFetchingRecent(false);
    }
  }

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
        fetchRecentTransactions();
      } else {
        setMessage({ type: 'error', text: data.error || 'Transaction failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Tabs Header */}
      <div className="bg-white flex border-b border-slate-200 px-8 pt-8 pb-4 space-x-12">
        <button
          onClick={() => setActiveTab('create')}
          className={cn(
            "text-base font-black transition-all relative pb-2 px-6 py-2 rounded-t-xl",
            activeTab === 'create' 
              ? "bg-[#0066cc] text-white shadow-lg shadow-blue-500/20" 
              : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
          )}
        >
          New Transaction
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={cn(
            "text-base font-black transition-all relative pb-2 px-6 py-2 rounded-t-xl",
            activeTab === 'manage' 
              ? "bg-[#00c58d] text-white shadow-lg shadow-emerald-500/20" 
              : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
          )}
        >
          Manage Transactions
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'create' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-[#0066cc] text-white px-8 py-4 rounded-t-[2rem] shadow-lg">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center">
                    <Plus className="w-5 h-5 mr-3" />
                    Process New Entry
                  </h2>
                </div>
                
                <div className="bg-white p-10 rounded-b-[2rem] shadow-xl border-x border-b border-slate-100 relative overflow-hidden group">
                  <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    {message && (
                      <div className={cn(
                        "p-4 rounded-2xl border flex items-center space-x-3 mb-6 animate-in slide-in-from-top-2",
                        message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-rose-50 border-rose-100 text-rose-700"
                      )}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        <span className="text-sm font-bold">{message.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-3 ml-1">Account Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={10}
                            placeholder="Enter 10-digit A/C"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                            required
                            className="w-full px-6 py-5 bg-[#f0f9ff] border-2 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 rounded-2xl text-xl font-black tracking-widest text-slate-900 transition-all outline-none"
                          />
                          {fetchingAccount && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Type</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setType('Deposit')}
                            className={cn(
                              "py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all",
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
                              "py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all",
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
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Amount (GHS)</label>
                      <div className="relative">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₵</div>
                        <input
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                          className="w-full pl-16 pr-6 py-6 bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-3xl font-black transition-all outline-none text-slate-900"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Remarks</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-6 py-5 bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 rounded-2xl text-sm font-bold transition-all outline-none h-32 text-slate-900 placeholder:text-slate-300"
                        placeholder="Add a reason or note for this transaction..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        "w-full py-6 rounded-2xl text-white font-black text-base uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl flex items-center justify-center space-x-4",
                        type === 'Deposit' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20",
                        loading && "opacity-70 pointer-events-none"
                      )}
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>
                          <span>Submit {type}</span>
                          <ArrowUpRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-slate-100 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center relative z-10 text-emerald-400">
                    <History className="w-4 h-4 mr-3" />
                    Account Summary
                  </h3>

                  {selectedAccountDetails ? (
                    <div className="relative z-10">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Available Balance</p>
                      <p className="text-5xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        ₵{Number(selectedAccountDetails.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Customer</span>
                          <span className="text-sm font-black">{selectedAccountDetails.first_name} {selectedAccountDetails.surname}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Card ID</span>
                          <span className="text-sm font-black text-emerald-400">#{selectedAccountDetails.account_number}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 relative z-10">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Search className="w-6 h-6 text-slate-600" />
                      </div>
                      <p className="text-slate-500 text-xs font-bold leading-relaxed px-4">Enter an account number to view the snapshot.</p>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-3 text-amber-500" />
                    Security Notice
                  </h3>
                  <ul className="space-y-6">
                    <li className="flex items-start space-x-4">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide leading-relaxed">Always verify the member's photo and identity before processing.</p>
                    </li>
                    <li className="flex items-start space-x-4">
                      <div className="w-1 h-1 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide leading-relaxed">System-wide 12-hour window available for self-correction.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">MANAGE TRANSACTIONS</h2>
                  <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Audit trail and record correction</p>
                </div>
                <button 
                  onClick={fetchRecentTransactions} 
                  className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center space-x-3"
                >
                  <History className="w-3 h-3" />
                  <span>Pull Latest Records</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white uppercase tracking-[0.2em]">
                      <th className="px-8 py-6 text-[10px] font-black border-b border-slate-800">Timestamp</th>
                      <th className="px-8 py-6 text-[10px] font-black border-b border-slate-800">Member</th>
                      <th className="px-8 py-6 text-[10px] font-black border-b border-slate-800">Account</th>
                      <th className="px-8 py-6 text-[10px] font-black border-b border-slate-800">Flow</th>
                      <th className="px-8 py-6 text-[10px] font-black border-b border-slate-800 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fetchingRecent ? (
                      Array(5).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-8 py-10"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                        </tr>
                      ))
                    ) : recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <History className="w-8 h-8 text-slate-200" />
                          </div>
                          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No transactions available to display</p>
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.map((tx) => {
                        const canModify = !isFieldOfficer || (new Date().getTime() - new Date(tx.transaction_date).getTime() < 12 * 60 * 60 * 1000);
                        
                        return (
                          <tr key={tx.transaction_id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-900 mb-1">
                                  {new Date(tx.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {new Date(tx.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-sm font-black text-slate-900 uppercase underline decoration-slate-200 decoration-2 underline-offset-4">{tx.first_name} {tx.surname}</span>
                            </td>
                            <td className="px-8 py-6 font-black text-xs text-slate-500 tracking-tighter">#{tx.account_number}</td>
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-4">
                                <span className={cn(
                                  "text-lg font-black tracking-tight shrink-0",
                                  tx.transaction_type === 'Deposit' ? "text-emerald-600" : "text-rose-600"
                                )}>
                                  {tx.transaction_type === 'Deposit' ? '+' : '-'} {parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                                <span className={cn(
                                  "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                  tx.transaction_type === 'Deposit' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                )}>
                                  {tx.transaction_type}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              {canModify ? (
                                <div className="flex items-center justify-end space-x-3">
                                  <button 
                                    onClick={() => {
                                      setEditTransaction(tx);
                                      setEditAmount(tx.amount);
                                      setEditDescription(tx.description || '');
                                    }}
                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setVoidTransaction(tx)}
                                    className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-rose-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end px-3">
                                  <span title="Locked (12h passed)">
                                    <Clock className="w-5 h-5 text-slate-200" />
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-8 bg-slate-50/50 text-center border-t border-slate-100">
                 <a href="/reports/ledger" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-blue-600 transition-colors">Go to Administrative Ledger</a>
              </div>
            </div>
          </div>
        )}
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
                      setMessage({ type: 'success', text: 'Transaction voided and balance reversed.' });
                      fetchRecentTransactions();
                      if (accountNumber === voidTransaction.account_number) handleLookup(accountNumber);
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
                      setMessage({ type: 'success', text: 'Transaction updated and balance adjusted.' });
                      fetchRecentTransactions();
                      if (accountNumber === editTransaction.account_number) handleLookup(accountNumber);
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
