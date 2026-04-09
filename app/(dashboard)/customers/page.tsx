'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Loader2,
  Filter,
  Download
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Customer {
  customer_number: number;
  first_name: string;
  surname: string;
  gender: string;
  phone_number: string;
  ghana_card_number: string;
  mobile_banker: string;
  passport_photo: string;
  registration_date: string;
  customer_type_name: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to load customers.');
        setCustomers([]);
      } else {
        setCustomers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Network error — could not reach the server.');
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(c => 
    `${c.first_name} ${c.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone_number?.includes(searchTerm) ||
    c.customer_number.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Could not load customers</h2>
        <p className="text-slate-500 text-sm max-w-xs">{error}</p>
        <button
          onClick={() => { setError(null); setLoading(true); fetchCustomers(); }}
          className="mt-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customers</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and view your microfinance members.</p>
        </div>
        <div className="flex items-center space-x-3">
          <a 
            href="/api/pdf/customers" 
            target="_blank"
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </a>
          <Link 
            href="/customers/new" 
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add Customer</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input spellCheck={false} 
              type="text" 
              placeholder="Search by name, phone or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm transition-all outline-none" 
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map((customer) => (
                <tr key={customer.customer_number} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex-shrink-0">
                        {customer.passport_photo ? (
                          <Image 
                            src={customer.passport_photo} 
                            alt={customer.first_name} 
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-400 font-bold text-lg uppercase bg-emerald-50 text-emerald-600">
                            {customer.first_name?.[0] ?? '?'}{customer.surname?.[0] ?? ''}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">
                          {customer.first_name} {customer.surname}
                        </p>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">ID: #00{customer.customer_number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-700">{customer.phone_number || 'N/A'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Mobile</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
                      {customer.customer_type_name || 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-slate-600 font-medium">Banker: <span className="text-slate-900 font-bold">{customer.mobile_banker || 'N/A'}</span></p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter font-bold">
                        Since {new Date(customer.registration_date).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No customers found</h3>
              <p className="text-slate-400 text-sm max-w-xs mt-1">We couldn't find any customers matching your search criteria. Try a different term.</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-6 text-emerald-600 font-bold text-sm hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredCustomers.length} of {customers.length} Customers
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-400 disabled:opacity-50 cursor-not-allowed">Previous</button>
            <button className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
