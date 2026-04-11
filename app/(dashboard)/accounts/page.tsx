'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Loader2,
  Filter,
  User,
  ShieldCheck,
  MoreVertical,
  Activity,
  AlertCircle,
  Download,
  LayoutGrid,
  Printer,
  ChevronDown,
  CheckCircle2,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface Account {
  account_number: number | string;
  first_name: string;
  surname: string;
  customer_number: number | string;
  account_type_name: string;
  account_status_name: string;
  balance: string | number;
  created_at: string;
  mobile_banker?: string;
}

interface Customer {
  customer_number: number;
  first_name: string;
  surname: string;
}

interface AccountType {
  account_type_number: number;
  account_type_name: string;
}

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'print'>('create');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Create Form State
  const [searchCustomer, setSearchCustomer] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    account_type: '',
    initial_balance: '',
    mobile_banker: ''
  });

  // Manage State
  const [searchTerm, setSearchTerm] = useState('');

  // Generated Account Number
  const generatedAccountNumber = useMemo(() => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }, [activeTab === 'create']);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [accRes, custRes, typeRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/customers'),
        fetch('/api/account-types')
      ]);

      const [accData, custData, typeData] = await Promise.all([
        accRes.json(),
        custRes.json(),
        typeRes.json()
      ]);

      if (Array.isArray(accData)) setAccounts(accData);
      if (Array.isArray(custData)) setCustomers(custData);
      if (Array.isArray(typeData)) setAccountTypes(typeData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('Please select a customer.');
      return;
    }
    if (!formData.account_type) {
      setError('Please select an account type.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_number: selectedCustomer.customer_number,
          account_type: formData.account_type,
          initial_balance: parseFloat(formData.initial_balance) || 0,
          mobile_banker: formData.mobile_banker
        }),
      });

      if (res.ok) {
        setSuccess('Account successfully opened!');
        setFormData({ account_type: '', initial_balance: '', mobile_banker: '' });
        setSelectedCustomer(null);
        setSearchCustomer('');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to open account.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    `${c.first_name} ${c.surname}`.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.customer_number.toString().includes(searchCustomer)
  );

  const filteredAccounts = accounts.filter(a =>
    `${a.first_name} ${a.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.account_number.toString().includes(searchTerm)
  );

  const exportToCSV = () => {
    const headers = ['Account Number', 'Customer', 'Type', 'Status', 'Balance', 'Date Created', 'Mobile Banker'];
    const rows = accounts.map(a => [
      a.account_number,
      `${a.first_name} ${a.surname}`,
      a.account_type_name,
      a.account_status_name,
      a.balance,
      new Date(a.created_at).toLocaleDateString(),
      a.mobile_banker || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `accounts_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Tabs Header */}
      <div className="bg-slate-800 text-white flex border-b border-slate-700">
        <button 
          onClick={() => setActiveTab('create')}
          className={cn(
            "flex items-center space-x-2 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'create' ? "bg-[#00c58d] text-white" : "hover:bg-slate-700 text-slate-400"
          )}
        >
          <CreditCard className="w-4 h-4" />
          <span>Create new account</span>
        </button>
        <button 
          onClick={() => setActiveTab('manage')}
          className={cn(
            "flex items-center space-x-2 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'manage' ? "bg-[#0066cc] text-white" : "hover:bg-slate-700 text-slate-400"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Manage account</span>
        </button>
        <button 
          onClick={() => setActiveTab('print')}
          className={cn(
            "flex items-center space-x-2 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all",
            activeTab === 'print' ? "bg-[#0b1424] text-white" : "hover:bg-slate-700 text-slate-400"
          )}
        >
          <Printer className="w-4 h-4" />
          <span>Print all account</span>
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Banner */}
            <div className="bg-[#0066cc] text-white px-8 py-4 rounded-t-2xl shadow-lg">
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">CUSTOMER ACCOUNT OPENING FORM</h2>
            </div>
            
            <div className="bg-white p-10 rounded-b-2xl shadow-xl border-x border-b border-slate-200">
              {/* Status Bar (Green box in image) */}
              <div className="w-full h-8 bg-[#00c58d] rounded-lg mb-8 relative">
                 <button className="absolute right-2 top-1 text-white/50 hover:text-white">×</button>
              </div>

              {success && (
                <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center shadow-sm">
                  <CheckCircle2 className="w-5 h-5 mr-3" />
                  <span className="font-bold text-sm uppercase tracking-tight">{success}</span>
                </div>
              )}

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center shadow-sm">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  <span className="font-bold text-sm uppercase tracking-tight">{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateAccount} className="space-y-8">
                {/* Account Number Field */}
                <div>
                  <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Account number</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={generatedAccountNumber}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black tracking-widest text-[#0b1424] cursor-not-allowed shadow-inner"
                  />
                </div>

                {/* Nested Box */}
                <div className="bg-slate-50 rounded-3xl p-1 border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-[#0066cc] text-white px-6 py-3">
                    <h3 className="text-xs font-black uppercase tracking-widest">Open New Account</h3>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    {/* Select Customer */}
                    <div className="relative">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Select Customer</label>
                      <div className="relative">
                        <input 
                          type="text"
                          placeholder={selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.surname} (#${selectedCustomer.customer_number})` : "-- Select Customer --"}
                          value={searchCustomer}
                          onChange={(e) => {
                             setSearchCustomer(e.target.value);
                             setShowCustomerList(true);
                          }}
                          onFocus={() => setShowCustomerList(true)}
                          className={cn(
                            "w-full p-4 bg-[#f0f9ff] border-2 border-slate-300 rounded-xl text-sm font-black text-slate-950 shadow-sm focus:ring-4 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc] outline-none transition-all",
                            selectedCustomer && !searchCustomer ? "placeholder-blue-600" : "placeholder:text-slate-400"
                          )}
                        />
                        <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
                      </div>
                      
                      {showCustomerList && searchCustomer && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(c => (
                              <button
                                key={c.customer_number}
                                type="button"
                                onClick={() => {
                                  setSelectedCustomer(c);
                                  setSearchCustomer('');
                                  setShowCustomerList(false);
                                }}
                                className="w-full text-left px-6 py-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                              >
                                <p className="text-sm font-black text-slate-900">{c.first_name} {c.surname}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {c.customer_number}</p>
                              </button>
                            ))
                          ) : (
                            <div className="px-6 py-4 text-xs font-bold text-slate-400 text-center">No customers found</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Account Type */}
                    <div>
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Account Type</label>
                      <select 
                        value={formData.account_type}
                        onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                        className="w-full p-4 bg-[#f0f9ff] border-2 border-slate-300 rounded-xl text-sm font-black text-slate-950 shadow-sm focus:ring-4 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc] outline-none appearance-none transition-all"
                      >
                        <option value="">-- Select Type --</option>
                        {accountTypes.map(typ => (
                          <option key={typ.account_type_number} value={typ.account_type_number}>
                            {typ.account_type_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                       <div>
                          <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Initial Balance (₵)</label>
                          <input 
                            type="number"
                            placeholder="0.00"
                            value={formData.initial_balance}
                            onChange={(e) => setFormData({...formData, initial_balance: e.target.value})}
                            className="w-full p-4 bg-[#f0f9ff] border-2 border-slate-300 rounded-xl text-sm font-black text-slate-950 shadow-sm focus:ring-4 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc] outline-none transition-all placeholder:text-slate-400"
                          />
                       </div>
                       <div>
                          <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Name of Mobile Banker</label>
                          <input 
                            type="text"
                            placeholder="Enter banker name..."
                            value={formData.mobile_banker}
                            onChange={(e) => setFormData({...formData, mobile_banker: e.target.value})}
                            className="w-full p-4 bg-[#f0f9ff] border-2 border-slate-300 rounded-xl text-sm font-black text-slate-950 shadow-sm focus:ring-4 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc] outline-none transition-all placeholder:text-slate-400"
                          />
                       </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-[#00c58d] text-white rounded-2xl text-base font-black uppercase tracking-[0.2em] shadow-lg shadow-[#00c58d]/20 hover:bg-[#00ad7c] active:scale-95 transition-all flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'CONFIRM AND OPEN ACCOUNT'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="animate-in fade-in duration-500">
             {/* Search and Filters */}
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-4">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">MANAGE ACCOUNTS</h2>
                   <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Active records in the system</p>
                </div>
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search by name or account number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-[#0066cc]/10 focus:border-[#0066cc]/50 rounded-2xl text-sm transition-all outline-none font-medium shadow-sm"
                  />
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Account Details</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Type / Status</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Mobile Banker</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Current Balance</th>
                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="px-8 py-10"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                          </tr>
                        ))
                      ) : filteredAccounts.map((account) => (
                        <tr key={account.account_number} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0066cc] shadow-sm border border-blue-100 flex-shrink-0">
                                <CreditCard className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 leading-none mb-1.5 underline decoration-blue-200 underline-offset-4">
                                  #{account.account_number}
                                </p>
                                <p className="text-[11px] font-bold text-slate-400 flex items-center uppercase tracking-tight">
                                  <User className="w-3 h-3 mr-1.5 text-blue-400" />
                                  {account.first_name} {account.surname}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col space-y-1.5">
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter flex items-center">
                                <ShieldCheck className="w-3.5 h-3.5 mr-2 text-[#0066cc]" />
                                {account.account_type_name}
                              </span>
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest w-fit border shadow-sm",
                                account.account_status_name === 'Active' 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : "bg-red-50 text-red-700 border-red-200"
                              )}>
                                {account.account_status_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-blue-200" />
                                <span className="text-[11px] font-black text-slate-600 uppercase">{account.mobile_banker || '---'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-slate-900 tracking-tighter">
                                ₵{parseFloat(account.balance.toString()).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center mt-1">
                                {new Date(account.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button className="p-2.5 text-slate-300 hover:text-[#0066cc] hover:bg-blue-50 rounded-xl transition-all">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        )}

        {activeTab === 'print' && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto text-center py-20">
             <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Printer className="w-10 h-10 text-slate-300" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">Print & Export Reports</h2>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-12">Select your preferred format to export the accounts database</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-10">
                <button 
                  onClick={exportToCSV}
                  className="flex flex-col items-center justify-center p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-[#00c58d] hover:shadow-2xl transition-all group"
                >
                   <div className="w-16 h-16 bg-[#00c58d]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Download className="w-8 h-8 text-[#00c58d]" />
                   </div>
                   <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Export to Excel</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CSV format for spreadsheets</p>
                </button>

                <button 
                  onClick={() => window.print()}
                  className="flex flex-col items-center justify-center p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-blue-500 hover:shadow-2xl transition-all group"
                >
                   <div className="w-16 h-16 bg-blue-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-blue-500" />
                   </div>
                   <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Print to PDF</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System generated report view</p>
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

