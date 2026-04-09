'use client';

import { useState, useEffect } from 'react';
import { 
  Users2, 
  Plus, 
  Loader2,
  Trash2,
  Edit2,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

interface CustomerType {
  customer_type_number: number;
  customer_type_name: string;
}

export default function CustomerTypesPage() {
  const [types, setTypes] = useState<CustomerType[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetchTypes();
  }, []);

  async function fetchTypes() {
    setDataLoading(true);
    try {
      const res = await fetch('/api/customer-types');
      const data = await res.json();
      setTypes(data);
    } catch (error) {
      console.error('Error fetching customer types:', error);
    } finally {
      setDataLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/customer-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setName('');
        fetchTypes();
      }
    } catch (error) {
      console.error('Error adding customer type:', error);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Customer Types</h1>
        <p className="text-slate-500 font-medium mt-1">Categorize your customers for better reporting and services.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 sticky top-24">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Plus className="w-5 h-5 mr-3 text-emerald-500" />
              Add New Type
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Type Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-2xl text-sm font-bold transition-all outline-none" 
                  placeholder="e.g. Regular, Gold, Enterprise"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Create Category</span>
                    <Plus className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-8 border-b border-slate-50 bg-slate-50/20">
               <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight flex items-center">
                 <Users2 className="w-5 h-5 mr-3 text-emerald-500" />
                 Defined Categories
               </h3>
            </div>
            
            <div className="divide-y divide-slate-50">
              {types.length > 0 ? types.map((type) => (
                <div key={type.customer_type_number} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none">{type.customer_type_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">ID: #{type.customer_type_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-slate-50/10">
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                     <Users2 className="w-8 h-8 text-slate-200" />
                   </div>
                   <h4 className="text-sm font-bold text-slate-900 underline decoration-emerald-200 decoration-2 underline-offset-4">No categories created yet</h4>
                   <p className="text-xs text-slate-400 font-medium mt-1 animate-pulse">Use the form on the left to add your first customer type.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50/50 border-t border-slate-50">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center italic">
                 Manage customer segments for targeted financial products.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
