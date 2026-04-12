'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Search,
  Activity,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Customer {
  customer_number: string;
  first_name: string;
  surname: string;
}

interface AccountType {
  account_type_number: string;
  account_type_name: string;
}

interface AccountStatus {
  account_status_number: string;
  account_status_name: string;
}

export default function OpenAccountPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [accountStatuses, setAccountStatuses] = useState<AccountStatus[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generatedAccountNumber, setGeneratedAccountNumber] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    account_type_id: '',
    account_status_id: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, typeRes, statusRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/account-types'),
          fetch('/api/account-status')
        ]);

        const [custData, typeData, statusData] = await Promise.all([
          custRes.json(),
          typeRes.json(),
          statusRes.json()
        ]);

        if (Array.isArray(custData)) setCustomers(custData);
        if (Array.isArray(typeData)) {
          setAccountTypes(typeData);
          if (typeData.length > 0) setFormData(prev => ({ ...prev, account_type_id: typeData[0].account_type_number.toString() }));
        }
        if (Array.isArray(statusData)) {
          setAccountStatuses(statusData);
          const activeStatus = statusData.find(s => s.account_status_name === 'Active');
          if (activeStatus) setFormData(prev => ({ ...prev, account_status_id: activeStatus.account_status_number.toString() }));
          else if (statusData.length > 0) setFormData(prev => ({ ...prev, account_status_id: statusData[0].account_status_number.toString() }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setFetchingData(false);
      }
    }
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredCustomers = customers.filter(c => 
    `${c.first_name} ${c.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_number.toString().includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.customer_id) {
      setError('Please select a customer.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: formData.customer_id,
          account_type_id: formData.account_type_id,
          account_status_id: formData.account_status_id,
          initial_balance: 0
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedAccountNumber(data.account_number);
        setSuccess(true);
        setTimeout(() => {
          router.push('/accounts');
          router.refresh();
        }, 3000);
      } else {
        setError(data.error || 'Failed to open account.');
      }
    } catch (err) {
      setError('Network error — could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 px-4">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Opened!</h2>
        <div className="mt-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 inline-block">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none mb-2">New Account Number</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">{generatedAccountNumber}</p>
        </div>
        <p className="text-slate-500 font-medium mt-6">Redirecting you to the account list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-4">
          <Link 
            href="/accounts" 
            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 rounded-2xl transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Open New Account</h1>
            <p className="text-slate-500 font-medium mt-1">Assign a unique 10-digit number to a member.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center space-x-3 animate-in shake duration-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form Fields */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 gap-8">
                
                {/* Member Selection Section */}
                <div className="space-y-4">
                  <div className="border-b border-slate-50 pb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                      <User className="w-4 h-4 mr-2 text-emerald-500" />
                      Select Member
                    </h3>
                  </div>
                  
                  <div className="relative group">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search member by name or ID..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-sm font-bold outline-none transition-all"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto bg-slate-50 rounded-[1.5rem] p-2 space-y-1">
                    {fetchingData ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                      </div>
                    ) : filteredCustomers.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 font-bold text-xs uppercase">No members found</div>
                    ) : (
                      filteredCustomers.map(customer => (
                        <button
                          key={customer.customer_number}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, customer_id: customer.customer_number.toString() }))}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group",
                            formData.customer_id === customer.customer_number.toString() 
                              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                              : "hover:bg-white text-slate-600"
                          )}
                        >
                          <span className="text-sm font-bold">{customer.first_name} {customer.surname}</span>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            formData.customer_id === customer.customer_number.toString() ? "text-emerald-100" : "text-slate-300"
                          )}>ID: #{customer.customer_number}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Account Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="col-span-full border-b border-slate-50 pb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
                      Account Settings
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Account Type</label>
                    <select 
                      name="account_type_id"
                      value={formData.account_type_id}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none text-slate-900 appearance-none cursor-pointer"
                    >
                      {fetchingData ? (
                        <option>Loading types...</option>
                      ) : (
                        accountTypes.map(type => (
                          <option key={type.account_type_number} value={type.account_type_number}>
                            {type.account_type_name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Initial Status</label>
                    <select 
                      name="account_status_id"
                      value={formData.account_status_id}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none text-slate-900 appearance-none cursor-pointer"
                    >
                      {fetchingData ? (
                        <option>Loading statuses...</option>
                      ) : (
                        accountStatuses.map(status => (
                          <option key={status.account_status_number} value={status.account_status_number}>
                            {status.account_status_name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                </div>
              </div>

              <div className="mt-12 flex items-center justify-end space-x-4">
                <Link 
                  href="/accounts"
                  className="px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-900 rounded-2xl transition-colors"
                >
                  Discard
                </Link>
                <button 
                  type="submit"
                  disabled={loading || fetchingData}
                  className="relative group px-10 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black tracking-tight hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="relative flex items-center">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Number...
                      </>
                    ) : (
                      <>
                        Generate & Open Account
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Tips Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="font-black text-sm uppercase tracking-widest opacity-80 leading-none">Smart Generation</h4>
                <p className="mt-4 text-slate-300 font-medium leading-relaxed">
                  The system will automatically generate a unique **10-digit number** for this account. You don't need to manually enter one.
                </p>
              </div>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] relative group">
              <h4 className="font-black text-xs text-emerald-600 uppercase tracking-widest mb-4">Security Notice</h4>
              <p className="text-emerald-700/70 text-sm font-medium leading-relaxed">
                Ensure you have verified the member's identity before opening a new credit or savings account.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
