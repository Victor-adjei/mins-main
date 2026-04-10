'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  CreditCard, 
  Building2, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  UploadCloud
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CustomerType {
  customer_type_number: number;
  customer_type_name: string;
}

export default function AddCustomerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(true);
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    gender: 'Male',
    phone_number: '',
    ghana_card_number: '',
    mobile_banker: '',
    customer_type: '',
    passport_photo: ''
  });

  useEffect(() => {
    async function getTypes() {
      try {
        const res = await fetch('/api/customer-types');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCustomerTypes(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, customer_type: data[0].customer_type_number.toString() }));
          }
        }
      } catch (err) {
        console.error('Error fetching types:', err);
      } finally {
        setFetchingTypes(false);
      }
    }
    getTypes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Upload to server
    setLoading(true);
    setError(null);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, passport_photo: data.url }));
      } else {
        setError(data.error || 'Failed to upload photo.');
      }
    } catch (err) {
      setError('Connection error while uploading.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.first_name || !formData.surname || !formData.phone_number) {
      setError('Please fill in all required fields (First name, Surname, and Phone number).');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/customers');
          router.refresh();
        }, 2000);
      } else {
        setError(data.error || 'Failed to create customer.');
      }
    } catch (err) {
      setError('Network error — could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Customer Registered!</h2>
        <p className="text-slate-500 font-medium mt-2">Redirecting you to the customer list...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center space-x-4">
          <Link 
            href="/customers" 
            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 rounded-2xl transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Add New Customer</h1>
            <p className="text-slate-500 font-medium mt-1">Register a new member to the system.</p>
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
          
          {/* Sidebar / Photo Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-40 h-40 rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all overflow-hidden mb-6"
              >
                {previewUrl ? (
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Camera className="w-10 h-10 mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Upload Photo</span>
                  </div>
                )}
                {loading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Passport Photo</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 px-2">JPG, PNG or WEBP. Max 2MB. A clear front-facing photo is recommended.</p>
            </div>

            <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <h4 className="font-black text-sm uppercase tracking-widest opacity-80">Quick Tip</h4>
                <p className="mt-3 text-emerald-50 font-medium leading-relaxed">
                  Ensure the Ghana Card number is entered exactly as it appears on the physical card to avoid verification issues.
                </p>
              </div>
            </div>
          </div>

          {/* Main Form Fields */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info Header */}
                <div className="col-span-full border-b border-slate-50 pb-4 mb-2">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <User className="w-4 h-4 mr-2 text-emerald-500" />
                    Identity Details
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name *</label>
                  <input 
                    required
                    type="text" 
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none text-slate-900" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Surname *</label>
                  <input 
                    required
                    type="text" 
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    placeholder="Enter surname"
                    className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none text-slate-900" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none text-slate-900 appearance-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Customer Type</label>
                  <select 
                    name="customer_type"
                    value={formData.customer_type}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none text-slate-900 appearance-none cursor-pointer"
                  >
                    {fetchingTypes ? (
                      <option>Loading types...</option>
                    ) : (
                      customerTypes.map(type => (
                        <option key={type.customer_type_number} value={type.customer_type_number}>
                          {type.customer_type_name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Contact Header */}
                <div className="col-span-full border-b border-slate-50 pb-4 mb-2 mt-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-emerald-500" />
                    Contact & Verification
                  </h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+233</span>
                    <input 
                      required
                      type="tel" 
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="50 000 0000"
                      className="w-full pl-16 pr-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none text-slate-900" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ghana Card (GHA-)</label>
                  <div className="relative">
                    <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input 
                      type="text" 
                      name="ghana_card_number"
                      value={formData.ghana_card_number}
                      onChange={handleInputChange}
                      placeholder="GHA-000000000-0"
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none text-slate-900" 
                    />
                  </div>
                </div>

                {/* Assignment Header */}
                <div className="col-span-full border-b border-slate-50 pb-4 mb-2 mt-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-emerald-500" />
                    Branch Assignment
                  </h3>
                </div>

                <div className="col-span-full space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Banker / Field Agent</label>
                  <input 
                    type="text" 
                    name="mobile_banker"
                    value={formData.mobile_banker}
                    onChange={handleInputChange}
                    placeholder="Enter assigned field agent name"
                    className="w-full px-6 py-4 bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none text-slate-900" 
                  />
                </div>
              </div>

              <div className="mt-12 flex items-center justify-end space-x-4">
                <Link 
                  href="/customers"
                  className="px-8 py-4 text-sm font-bold text-slate-400 hover:text-slate-900 rounded-2xl transition-colors"
                >
                  Discard
                </Link>
                <button 
                  type="submit"
                  disabled={loading}
                  className="relative group px-10 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black tracking-tight hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="relative flex items-center">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
