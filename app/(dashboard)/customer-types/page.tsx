'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Users2, 
  Plus, 
  Loader2,
  Trash2,
  Edit2,
  MoreVertical,
  CheckCircle2,
  Download,
  Printer,
  RotateCcw,
  LayoutGrid,
  FileText,
  AlertCircle
} from 'lucide-react';

interface CustomerType {
  customer_type_number: number;
  customer_type_name: string;
}

export default function CustomerTypesPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'manage' | 'print'>('add');
  const [types, setTypes] = useState<CustomerType[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generated Type Number for display
  const generatedTypeNumber = useMemo(() => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }, [activeTab === 'add']);

  useEffect(() => {
    fetchTypes();
  }, []);

  async function fetchTypes() {
    setDataLoading(true);
    try {
      const res = await fetch('/api/customer-types');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTypes(data);
      }
    } catch (error) {
      console.error('Error fetching customer types:', error);
    } finally {
      setDataLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/customer-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setSuccess('Customer category added successfully!');
        setName('');
        fetchTypes();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add category.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Type ID', 'Name'];
    const rows = types.map(t => [t.customer_type_number, t.customer_type_name]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer_types_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Tabs Header */}
      <div className="bg-slate-800 text-white flex border-b border-slate-700">
        <button 
          onClick={() => setActiveTab('add')}
          className={cn(
            "flex items-center space-x-2 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'add' ? "bg-[#00c58d] text-white" : "hover:bg-slate-700 text-slate-400"
          )}
        >
          <Plus className="w-4 h-4" />
          <span>Add new customer type</span>
        </button>
        <button 
          onClick={() => setActiveTab('manage')}
          className={cn(
            "flex items-center space-x-2 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'manage' ? "bg-slate-600 text-white" : "hover:bg-slate-700 text-slate-400"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Manage customer type</span>
        </button>
        <button 
          onClick={() => setActiveTab('print')}
          className={cn(
            "flex items-center space-x-2 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'print' ? "bg-[#0b1424] text-white" : "hover:bg-slate-700 text-slate-400"
          )}
        >
          <Printer className="w-4 h-4" />
          <span>Print all customer type</span>
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'add' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Status Bar */}
             <div className="w-full h-8 bg-[#00c58d] rounded-lg mb-8 relative">
                <button className="absolute right-2 top-1 text-white/50 hover:text-white">×</button>
             </div>

             {/* Banner */}
             <div className="bg-[#0066cc] text-white px-8 py-4 rounded-t-xl shadow-lg border-b border-blue-400">
                <h2 className="text-sm font-black uppercase tracking-widest">CUSTOMER TYPE</h2>
             </div>

             <div className="bg-white p-10 rounded-b-xl shadow-xl border-x border-b border-slate-200">
                <p className="text-xs font-bold text-slate-400 mb-6 italic">Fill all field as required</p>
                
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

                <form onSubmit={handleSubmit} className="space-y-8">
                   <div>
                      <label className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 block">Customer type number</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={generatedTypeNumber}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black tracking-widest text-slate-400 cursor-not-allowed shadow-inner"
                      />
                   </div>

                   <div>
                      <label className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3 block">Customer type name</label>
                      <input 
                        type="text"
                        placeholder="Customer type name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 bg-[#f0f9ff] border-2 border-slate-300 rounded-xl text-sm font-black text-slate-950 shadow-sm focus:ring-4 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc] outline-none transition-all placeholder:text-slate-400"
                      />
                   </div>

                   <div className="flex space-x-4 pt-4">
                      <button 
                         type="submit"
                         disabled={loading}
                         className="flex items-center space-x-2 px-8 py-4 bg-[#0066cc] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all"
                      >
                         <Plus className="w-4 h-4" />
                         <span>{loading ? 'Adding...' : 'Add customer type'}</span>
                      </button>
                      <button 
                         type="button"
                         onClick={() => setName('')}
                         className="flex items-center space-x-2 px-8 py-4 bg-[#e63946] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-700 active:scale-95 transition-all"
                      >
                         <RotateCcw className="w-4 h-4" />
                         <span>Reset</span>
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-8 px-4">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">MANAGE CUSTOMER TYPES</h2>
                   <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Available Categories</p>
                </div>
             </div>

             <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-800 text-white">
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Type ID</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Name</th>
                         <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {dataLoading ? (
                         Array(3).fill(0).map((_, i) => (
                           <tr key={i} className="animate-pulse">
                             <td colSpan={3} className="px-8 py-10"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                           </tr>
                         ))
                      ) : types.map((type) => (
                         <tr key={type.customer_type_number} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-8 py-6">
                               <span className="font-black text-slate-900 tracking-widest text-sm">#{type.customer_type_number}</span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                                     {type.customer_type_name[0]}
                                  </div>
                                  <span className="font-black text-slate-700 text-sm uppercase tracking-tight">{type.customer_type_name}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <div className="flex justify-end space-x-2">
                                  <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                                  <button className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                               </div>
                            </td>
                         </tr>
                      ))}
                      {!dataLoading && types.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-20 text-center">
                            <Users2 className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</p>
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'print' && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto text-center py-20 px-4">
             <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Printer className="w-10 h-10 text-slate-300" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">Print Customer Categories</h2>
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-12">Export established customer segments</p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                   onClick={exportToCSV}
                   className="flex flex-col items-center justify-center p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-[#00c58d] hover:shadow-2xl transition-all group shadow-sm"
                >
                   <div className="w-16 h-16 bg-[#00c58d]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Download className="w-8 h-8 text-[#00c58d]" />
                   </div>
                   <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Export to Excel</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CSV list of types</p>
                </button>

                <button 
                   onClick={() => window.print()}
                   className="flex flex-col items-center justify-center p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-blue-500 hover:shadow-2xl transition-all group shadow-sm"
                >
                   <div className="w-16 h-16 bg-blue-500/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-blue-500" />
                   </div>
                   <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Print to PDF</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formatted report view</p>
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
