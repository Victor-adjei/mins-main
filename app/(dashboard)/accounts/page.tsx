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
  FileText,
  Pencil,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

interface Account {
  account_number: string;
  first_name: string;
  surname: string;
  customer_number: string;
  customer_id?: number | string;
  customer?: string;
  account_type_name: string;
  account_type: number | string;
  customer_type_name?: string;
  account_status_name: string;
  account_status?: number;
  balance: string | number;
  created_at: string;
  mobile_banker?: string;
}

interface Customer {
  customer_number: string;
  customer_id?: number | string;
  first_name: string;
  surname: string;
  phone_number?: string;
  customer_type?: string | number;
  customer_type_name?: string;
  registration_date?: string;
  passport_photo?: string;
  mobile_banker?: string;
}

interface AccountType {
  account_type_number: number;
  account_type_name: string;
}

interface AccountStatus {
  account_status_number: number | string;
  account_status_name: string;
}

export default function AccountsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'print'>('create');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [accountStatuses, setAccountStatuses] = useState<AccountStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Manage State
  const [searchTerm, setSearchTerm] = useState('');
  const [manageFilter, setManageFilter] = useState<'all' | 'unassigned'>('all');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [displayLimit, setDisplayLimit] = useState(20);

  useEffect(() => {
    setDisplayLimit(20);
  }, [searchTerm, manageFilter]);

  // Generated Account Number
  const [generatedAccountNumber, setGeneratedAccountNumber] = useState('');

  useEffect(() => {
    setGeneratedAccountNumber(Math.floor(1000000000 + Math.random() * 9000000000).toString());
  }, [activeTab === 'create' && !editingAccount]);

  // Create Form State
  const [searchCustomer, setSearchCustomer] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    account_type: '',
    mobile_banker: '',
    account_status: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [accRes, custRes, typeRes, statusRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/customers'),
        fetch('/api/account-types'),
        fetch('/api/account-status')
      ]);

      const [accData, custData, typeData, statusData] = await Promise.all([
        accRes.json(),
        custRes.json(),
        typeRes.json(),
        statusRes.json()
      ]);

      if (Array.isArray(accData)) setAccounts(accData);
      if (Array.isArray(custData)) setCustomers(custData);
      if (Array.isArray(typeData)) setAccountTypes(typeData);
      if (Array.isArray(statusData)) setAccountStatuses(statusData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer && !editingAccount) {
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
      const method = editingAccount ? 'PUT' : 'POST';
      const url = editingAccount ? `/api/accounts/${editingAccount.account_number}` : '/api/accounts';

      const payload = {
        customer_number: selectedCustomer?.customer_number || editingAccount?.customer_number,
        account_type: formData.account_type,
        initial_balance: 0,
        mobile_banker: formData.mobile_banker,
        account_status: formData.account_status,
        account_number: editingAccount ? editingAccount.account_number : generatedAccountNumber
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(editingAccount ? 'Account successfully updated!' : 'Account successfully opened!');
        resetForm();
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
        if (editingAccount) setActiveTab('manage');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to process account.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ account_type: '', mobile_banker: '', account_status: 1 });
    setSelectedCustomer(null);
    setSearchCustomer('');
    setEditingAccount(null);
    setGeneratedAccountNumber(Math.floor(1000000000 + Math.random() * 9000000000).toString());
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      account_type: account.account_type.toString(),
      mobile_banker: account.mobile_banker || '',
      account_status: account.account_status || 1
    });
    setSelectedCustomer({
      customer_number: account.customer_number || account.customer || '',
      customer_id: account.customer_id,
      first_name: account.first_name,
      surname: account.surname
    });
    setActiveTab('create');
  };

  const handleOpenAccountForCustomer = (customer: Customer) => {
    resetForm();
    setSelectedCustomer(customer);
    setActiveTab('create');
  };

  const handleDelete = async (accountNumber: string | number) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const res = await fetch(`/api/accounts/${accountNumber}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Account deleted successfully');
        fetchData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete account');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handlePrintSingle = (account: Account) => {
    window.print();
  };

  // Set of customer identifiers (numbers and IDs) that have at least one account
  const assignedCustomerIdentifiers = useMemo(() => {
    const set = new Set<string>();
    accounts.forEach(a => {
      const num = a.customer_number || a.customer;
      if (num) set.add(num.toString().trim().toLowerCase());
      if (a.customer_id) set.add(a.customer_id.toString().trim().toLowerCase());
    });
    return set;
  }, [accounts]);

  // Registered customers who do not have an assigned account number
  const unassignedCustomers = useMemo(() => {
    return customers.filter(c => {
      const custNum = c.customer_number ? c.customer_number.toString().trim().toLowerCase() : '';
      const custId = c.customer_id ? c.customer_id.toString().trim().toLowerCase() : '';
      const hasAccount = (custNum && assignedCustomerIdentifiers.has(custNum)) || 
                         (custId && assignedCustomerIdentifiers.has(custId));
      return !hasAccount;
    });
  }, [customers, assignedCustomerIdentifiers]);

  const filteredCustomers = customers.filter(c => {
    const term = searchCustomer.trim().toLowerCase();
    if (!term) return true;
    const cleanId = term.replace(/^(id\s*[:#-]?\s*|#\s*|cust\s*[:#-]?\s*)/i, '').trim();
    const nameMatch = `${c.first_name || ''} ${c.surname || ''}`.toLowerCase().includes(term);
    const numMatch = (c.customer_number || '').toString().toLowerCase().includes(cleanId || term);
    const idMatch = c.customer_id ? c.customer_id.toString().toLowerCase().includes(cleanId || term) : false;
    return nameMatch || numMatch || idMatch;
  });

  const cleanSearchTerm = searchTerm.trim().toLowerCase();
  const strippedSearchTerm = cleanSearchTerm.replace(/^(id\s*[:#-]?\s*|#\s*|cust\s*[:#-]?\s*)/i, '').trim();

  // Filter accounts by Full Name, Account Number, or Customer ID
  const filteredAccounts = useMemo(() => {
    if (!cleanSearchTerm) return accounts;
    return accounts.filter(a => {
      const fullName = `${a.first_name || ''} ${a.surname || ''}`.toLowerCase();
      const accNum = (a.account_number || '').toString().toLowerCase();
      const custNum = (a.customer_number || a.customer || '').toString().toLowerCase();
      const custId = a.customer_id ? a.customer_id.toString().toLowerCase() : '';

      return (
        fullName.includes(cleanSearchTerm) ||
        accNum.includes(cleanSearchTerm) ||
        (strippedSearchTerm && accNum.includes(strippedSearchTerm)) ||
        custNum.includes(cleanSearchTerm) ||
        (strippedSearchTerm && custNum.includes(strippedSearchTerm)) ||
        custId.includes(cleanSearchTerm) ||
        (strippedSearchTerm && custId.includes(strippedSearchTerm))
      );
    });
  }, [accounts, cleanSearchTerm, strippedSearchTerm]);

  // Filter unassigned customers by Name, Customer ID, or Phone
  const filteredUnassignedCustomers = useMemo(() => {
    if (!cleanSearchTerm) return unassignedCustomers;
    return unassignedCustomers.filter(c => {
      const fullName = `${c.first_name || ''} ${c.surname || ''}`.toLowerCase();
      const custNum = (c.customer_number || '').toString().toLowerCase();
      const custId = c.customer_id ? c.customer_id.toString().toLowerCase() : '';
      const phone = (c.phone_number || '').toString().toLowerCase();

      return (
        fullName.includes(cleanSearchTerm) ||
        custNum.includes(cleanSearchTerm) ||
        (strippedSearchTerm && custNum.includes(strippedSearchTerm)) ||
        custId.includes(cleanSearchTerm) ||
        (strippedSearchTerm && custId.includes(strippedSearchTerm)) ||
        phone.includes(cleanSearchTerm)
      );
    });
  }, [unassignedCustomers, cleanSearchTerm, strippedSearchTerm]);

  // Check if search matches any registered customer who has NO account yet
  const matchingUnassignedInSearch = useMemo(() => {
    if (!cleanSearchTerm) return [];
    return unassignedCustomers.filter(c => {
      const fullName = `${c.first_name || ''} ${c.surname || ''}`.toLowerCase();
      const custNum = (c.customer_number || '').toString().toLowerCase();
      const custId = c.customer_id ? c.customer_id.toString().toLowerCase() : '';
      return (
        fullName.includes(cleanSearchTerm) ||
        custNum.includes(cleanSearchTerm) ||
        (strippedSearchTerm && custNum.includes(strippedSearchTerm)) ||
        custId.includes(cleanSearchTerm) ||
        (strippedSearchTerm && custId.includes(strippedSearchTerm))
      );
    });
  }, [unassignedCustomers, cleanSearchTerm, strippedSearchTerm]);

  const exportToCSV = () => {
    if (manageFilter === 'unassigned') {
      const headers = ['Customer ID', 'Customer Name', 'Customer Type', 'Phone Number', 'Registration Date'];
      const rows = filteredUnassignedCustomers.map(c => [
        `"${c.customer_number || c.customer_id || ''}"`,
        `"${c.first_name || ''} ${c.surname || ''}"`,
        `"${c.customer_type_name || 'Regular Customer'}"`,
        `"${c.phone_number || 'N/A'}"`,
        `"${c.registration_date ? new Date(c.registration_date).toLocaleDateString() : 'N/A'}"`
      ]);

      const csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `unassigned_customers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const headers = ['Account Number', 'Customer ID', 'Customer', 'Type', 'Status', 'Balance', 'Date Created', 'Mobile Banker'];
    const rows = filteredAccounts.map(a => [
      `"${a.account_number}"`,
      `"${a.customer_number || a.customer || a.customer_id || 'N/A'}"`,
      `"${a.first_name} ${a.surname}"`,
      `"${a.account_type_name}"`,
      `"${a.account_status_name}"`,
      `"${a.balance}"`,
      `"${new Date(a.created_at).toLocaleDateString()}"`,
      `"${a.mobile_banker || 'N/A'}"`
    ]);

    const csvContent = headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `accounts_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Tabs Header */}
      {/* Tabs Header */}
      <div className="flex h-12">
        <button
          onClick={() => { setActiveTab('create'); resetForm(); }}
          className={cn(
            "flex items-center space-x-2 px-6 font-semibold transition-colors",
            activeTab === 'create' ? "bg-[#28a745] text-white" : "bg-[#343a40] text-gray-300 hover:text-white"
          )}
        >
          <CreditCard className="w-4 h-4" />
          <span>{editingAccount ? 'Edit Account' : 'Create New Account'}</span>
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={cn(
            "flex items-center space-x-2 px-6 font-semibold transition-colors",
            activeTab === 'manage' ? "bg-[#28a745] text-white" : "bg-[#343a40] text-gray-300 hover:text-white"
          )}
        >
          <Activity className="w-4 h-4" />
          <span>Manage Account</span>
        </button>
        <button
          onClick={() => setActiveTab('print')}
          className={cn(
            "flex items-center space-x-2 px-6 font-semibold transition-colors",
            activeTab === 'print' ? "bg-[#28a745] text-white" : "bg-[#343a40] text-gray-300 hover:text-white"
          )}
        >
          <Printer className="w-4 h-4" />
          <span>Print All Accounts</span>
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'create' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Banner */}
            <div className="bg-[#28a745] text-white px-4 py-2 flex items-center mb-6">
              <Plus className="w-4 h-4 mr-2" />
              <span className="font-bold uppercase text-sm">
                {editingAccount ? 'EDIT CUSTOMER ACCOUNT DETAILS' : 'CUSTOMER ACCOUNT OPENING FORM'}
              </span>
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
                    value={editingAccount ? editingAccount.account_number : generatedAccountNumber}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black tracking-widest text-[#0b1424] cursor-not-allowed shadow-inner"
                  />
                </div>

                {/* Nested Box */}
                <div className="bg-slate-50 rounded-3xl p-1 border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-[#0066cc] text-white px-6 py-3">
                    <h3 className="text-xs font-black uppercase tracking-widest">
                      {editingAccount ? 'Update Existing Account' : 'Open New Account'}
                    </h3>
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
                                key={c.customer_number || c.customer_id}
                                type="button"
                                onClick={() => {
                                  setSelectedCustomer(c);
                                  setSearchCustomer('');
                                  setShowCustomerList(false);
                                }}
                                className="w-full text-left px-6 py-3 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                              >
                                <p className="text-sm font-black text-slate-900">{c.first_name} {c.surname}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {c.customer_number || c.customer_id}</p>
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
                        onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
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

                    <div>
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Name of Mobile Banker</label>
                      <input
                        type="text"
                        placeholder="Enter banker name..."
                        value={formData.mobile_banker}
                        onChange={(e) => setFormData({ ...formData, mobile_banker: e.target.value })}
                        className="w-full p-4 bg-[#f0f9ff] border-2 border-slate-300 rounded-xl text-sm font-black text-slate-950 shadow-sm focus:ring-4 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc] outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                    
                    {editingAccount && (
                      <div>
                        <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 block">Account Status</label>
                        <select
                          value={formData.account_status}
                          onChange={(e) => setFormData({ ...formData, account_status: Number(e.target.value) })}
                          className="w-full p-4 bg-[#f0f9ff] border-2 border-slate-300 rounded-xl text-sm font-black text-slate-950 shadow-sm focus:ring-4 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc] outline-none appearance-none transition-all"
                        >
                          {accountStatuses.map(status => (
                            <option key={status.account_status_number} value={status.account_status_number}>
                              {status.account_status_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-5 bg-[#00c58d] text-white rounded-2xl text-base font-black uppercase tracking-[0.2em] shadow-lg shadow-[#00c58d]/20 hover:bg-[#00ad7c] active:scale-95 transition-all flex items-center justify-center"
                  >
                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingAccount ? 'UPDATE ACCOUNT' : 'CONFIRM AND OPEN ACCOUNT')}
                  </button>
                  {editingAccount && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-8 py-5 bg-slate-500 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-lg hover:bg-slate-600 active:scale-95 transition-all"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="animate-in fade-in duration-500">
            {/* Search and Filters Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 px-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">MANAGE ACCOUNTS</h2>
                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {manageFilter === 'all' ? 'Active account records in the system' : 'Registered customers without an assigned account number'}
                </p>
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, account number or customer ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:ring-2 focus:ring-[#0066cc]/10 focus:border-[#0066cc]/50 rounded-2xl text-sm transition-all outline-none font-bold text-slate-900 shadow-sm"
                />
              </div>
            </div>

            {/* Sub-view Filter Pills */}
            <div className="flex items-center gap-3 px-4 mb-6">
              <button
                type="button"
                onClick={() => setManageFilter('all')}
                className={cn(
                  "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  manageFilter === 'all'
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                )}
              >
                <span>All Accounts</span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black",
                  manageFilter === 'all' ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
                )}>
                  {accounts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setManageFilter('unassigned')}
                className={cn(
                  "flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                  manageFilter === 'unassigned'
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "bg-white text-amber-700 hover:bg-amber-50 border border-amber-200"
                )}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Customers Without Account</span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-black",
                  manageFilter === 'unassigned' ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-900"
                )}>
                  {unassignedCustomers.length}
                </span>
              </button>
            </div>

            {/* Unassigned customer match notification when searching in All Accounts */}
            {manageFilter === 'all' && matchingUnassignedInSearch.length > 0 && (
              <div className="mx-4 mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-950 uppercase tracking-tight">
                      {matchingUnassignedInSearch.length === 1
                        ? 'Registered Customer Found (No Account Number Yet)'
                        : `${matchingUnassignedInSearch.length} Registered Customers Found Without Accounts`}
                    </h4>
                    <p className="text-xs font-semibold text-amber-800 mt-0.5">
                      {matchingUnassignedInSearch.length === 1 ? (
                        <>
                          Customer <span className="font-bold underline">{matchingUnassignedInSearch[0].first_name} {matchingUnassignedInSearch[0].surname}</span> (Customer ID: <span className="font-bold font-mono">{matchingUnassignedInSearch[0].customer_number || matchingUnassignedInSearch[0].customer_id}</span>) is registered in the system but does not have an assigned account number yet.
                        </>
                      ) : (
                        `Matching customers without accounts: ${matchingUnassignedInSearch.map(c => `${c.first_name} ${c.surname} (ID: ${c.customer_number || c.customer_id})`).join(', ')}`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (matchingUnassignedInSearch.length === 1) {
                        handleOpenAccountForCustomer(matchingUnassignedInSearch[0]);
                      } else {
                        setManageFilter('unassigned');
                      }
                    }}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center space-x-1.5 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{matchingUnassignedInSearch.length === 1 ? 'Open Account Now' : 'View Unassigned'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Table Section: All Accounts */}
            {manageFilter === 'all' && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">SN</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800 underline">Account number</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">Account Name & ID</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">Account Type</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">Customer Type</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">Account Status</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">Date Open</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={8} className="px-4 py-10"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                          </tr>
                        ))
                      ) : filteredAccounts.slice(0, displayLimit).map((account, index) => (
                        <tr key={account.account_number} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group">
                          <td className="px-5 py-6 text-xs font-bold text-slate-400">{index + 1}</td>
                          <td className="px-5 py-6 font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors underline decoration-blue-500/30 font-mono">
                            {account.account_number}
                          </td>
                          <td className="px-5 py-6">
                            <div className="font-black text-sm text-slate-900 uppercase tracking-tight">
                              {account.first_name} {account.surname}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                              Customer ID: <span className="text-slate-600 font-semibold font-mono">{account.customer_number || account.customer || account.customer_id || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-6 font-bold text-sm text-slate-600">{account.account_type_name}</td>
                          <td className="px-5 py-6 font-bold text-sm text-slate-500">{account.customer_type_name || 'Regular Customer'}</td>
                          <td className="px-5 py-6">
                            <span className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                              account.account_status_name === 'Active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                            )}>
                              {account.account_status_name}
                            </span>
                          </td>
                          <td className="px-5 py-6 font-bold text-sm text-slate-500">
                            {new Date(account.created_at).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-5 py-6 text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => handleEdit(account)}
                                className="p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all active:scale-90 shadow-sm border border-blue-100"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(account.account_number)}
                                className="p-2 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all active:scale-90 shadow-sm border border-rose-100"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handlePrintSingle(account)}
                                className="p-2 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl transition-all active:scale-90 shadow-sm border border-slate-100"
                                title="Print"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAccounts.length === 0 && !loading && (
                    <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
                      {searchTerm ? 'No accounts found matching your search.' : 'No accounts found.'}
                    </div>
                  )}
                  {filteredAccounts.length > displayLimit && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
                      <span className="text-xs font-bold text-slate-500">
                        Showing <strong className="text-slate-900">{Math.min(displayLimit, filteredAccounts.length)}</strong> of <strong className="text-slate-900">{filteredAccounts.length}</strong> accounts
                      </span>
                      <button
                        type="button"
                        onClick={() => setDisplayLimit((prev) => prev + 20)}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2"
                      >
                        <span>Load More (+20)</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Table Section: Customers Without Account */}
            {manageFilter === 'unassigned' && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">SN</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800 underline">Customer ID</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">Customer Name</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">Customer Type</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">Phone Number</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">Registration Date</th>
                        <th className="px-5 py-5 text-[10px] font-black uppercase tracking-widest border-b border-slate-800 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={7} className="px-4 py-10"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                          </tr>
                        ))
                      ) : filteredUnassignedCustomers.slice(0, displayLimit).map((cust, index) => (
                        <tr key={cust.customer_number || cust.customer_id || index} className="hover:bg-amber-50/40 transition-colors border-b border-slate-100 last:border-0 group">
                          <td className="px-5 py-6 text-xs font-bold text-slate-400">{index + 1}</td>
                          <td className="px-5 py-6 font-black text-sm text-amber-700 font-mono">
                            {cust.customer_number || cust.customer_id}
                          </td>
                          <td className="px-5 py-6 font-black text-sm text-slate-900 uppercase tracking-tight">
                            {cust.first_name} {cust.surname}
                          </td>
                          <td className="px-5 py-6 font-bold text-sm text-slate-600">
                            {cust.customer_type_name || 'Regular Customer'}
                          </td>
                          <td className="px-5 py-6 font-bold text-sm text-slate-600">
                            {cust.phone_number || 'N/A'}
                          </td>
                          <td className="px-5 py-6 font-bold text-sm text-slate-500">
                            {cust.registration_date ? new Date(cust.registration_date).toLocaleDateString('en-GB') : 'N/A'}
                          </td>
                          <td className="px-5 py-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenAccountForCustomer(cust)}
                              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#00c58d] hover:bg-[#00ad7c] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                              title="Open account for this customer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Open Account</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUnassignedCustomers.length === 0 && !loading && (
                    <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
                      {searchTerm ? 'No unassigned customers match your search.' : 'All registered customers currently have assigned accounts.'}
                    </div>
                  )}
                  {filteredUnassignedCustomers.length > displayLimit && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
                      <span className="text-xs font-bold text-slate-500">
                        Showing <strong className="text-slate-900">{Math.min(displayLimit, filteredUnassignedCustomers.length)}</strong> of <strong className="text-slate-900">{filteredUnassignedCustomers.length}</strong> unassigned customers
                      </span>
                      <button
                        type="button"
                        onClick={() => setDisplayLimit((prev) => prev + 20)}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center space-x-2"
                      >
                        <span>Load More (+20)</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'print' && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Printer className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">Print & Export Reports</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-12">Select your preferred format to export the accounts database</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-10">
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

              <a
                href="/api/pdf/accounts"
                target="_blank"
                className="flex flex-col items-center justify-center p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-rose-500 hover:shadow-2xl transition-all group"
              >
                <div className="w-16 h-16 bg-rose-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Download PDF</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formal Document Export</p>
              </a>

              <button
                onClick={() => window.print()}
                className="flex flex-col items-center justify-center p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-blue-500 hover:shadow-2xl transition-all group"
              >
                <div className="w-16 h-16 bg-blue-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Printer className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Browser Print</h3>
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





