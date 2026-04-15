'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Download,
  Users,
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import Image from 'next/image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Customer {
  customer_number: string;
  first_name: string;
  middle_name: string;
  surname: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  phone_number: string;
  ghana_card_number: string;
  mobile_banker: string;
  passport_photo: string;
  registration_date: string;
  customer_type: string | number;
  customer_type_name?: string;
}

interface CustomerType {
  customer_type_number: number;
  customer_type_name: string;
}

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    surname: '',
    gender: 'Male',
    date_of_birth: '',
    nationality: 'Ghanaian',
    phone_number: '',
    ghana_card_number: '',
    mobile_banker: '',
    customer_type: '',
    passport_photo: '',
    customer_number: ''
  });

  const [nextCustomerNumber, setNextCustomerNumber] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchCustomerTypes();
    setNextCustomerNumber(Math.floor(10000000 + Math.random() * 90000000).toString());
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to load customers.');
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

  async function fetchCustomerTypes() {
    try {
      const res = await fetch('/api/customer-types');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCustomerTypes(data);
        if (data.length > 0 && !formData.customer_type) {
          setFormData(prev => ({ ...prev, customer_type: data[0].customer_type_number.toString() }));
        }
      }
    } catch (err) {
      console.error('Error fetching types:', err);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setSubmitting(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, passport_photo: data.url }));
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const method = editingCustomer ? 'PUT' : 'POST';
    const url = editingCustomer ? `/api/customers/${editingCustomer.customer_number}` : '/api/customers';

    const submissionData = editingCustomer
      ? formData
      : { ...formData, customer_number: nextCustomerNumber };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setActiveTab('manage');
          setEditingCustomer(null);
          resetForm();
          fetchCustomers();
          setNextCustomerNumber(Math.floor(10000000 + Math.random() * 90000000).toString());
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Operation failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      surname: '',
      gender: 'Male',
      date_of_birth: '',
      nationality: 'Ghanaian',
      phone_number: '',
      ghana_card_number: '',
      mobile_banker: '',
      customer_type: customerTypes[0]?.customer_type_number.toString() || '',
      passport_photo: '',
      customer_number: nextCustomerNumber
    });
    setPreviewUrl(null);
    setEditingCustomer(null);
    setNextCustomerNumber(Math.floor(10000000 + Math.random() * 90000000).toString());
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      first_name: customer.first_name || '',
      middle_name: customer.middle_name || '',
      surname: customer.surname || '',
      gender: customer.gender || 'Male',
      date_of_birth: customer.date_of_birth ? new Date(customer.date_of_birth).toISOString().split('T')[0] : '',
      nationality: customer.nationality || 'Ghanaian',
      phone_number: customer.phone_number || '',
      ghana_card_number: customer.ghana_card_number || '',
      mobile_banker: customer.mobile_banker || '',
      customer_type: customer.customer_type?.toString() || '',
      passport_photo: customer.passport_photo || '',
      customer_number: customer.customer_number || ''
    });
    setPreviewUrl(customer.passport_photo || null);
    setActiveTab('add');
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCustomers();
      } else {
        alert('Failed to delete customer.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const filteredCustomers = customers.filter(c =>
    `${c.first_name} ${c.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone_number?.includes(searchTerm) ||
    c.customer_number.toString().includes(searchTerm)
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Tab Headers */}
      <div className="flex h-12">
        <button
          onClick={() => { setActiveTab('add'); if (!editingCustomer) resetForm(); }}
          className={cn(
            "flex items-center space-x-2 px-6 font-semibold transition-colors",
            activeTab === 'add' ? "bg-[#28a745] text-white" : "bg-[#343a40] text-gray-300 hover:text-white"
          )}
        >
          <UserPlus className="w-4 h-4" />
          <span>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</span>
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={cn(
            "flex items-center space-x-2 px-6 font-semibold transition-colors",
            activeTab === 'manage' ? "bg-[#28a745] text-white" : "bg-[#343a40] text-gray-300 hover:text-white"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Manage Customers</span>
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'add' ? (
          <div className="max-w-6xl">
            {/* Header Banner */}
            <div className="bg-[#28a745] text-white px-4 py-2 flex items-center mb-6">
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="font-bold uppercase text-sm">
                {editingCustomer ? 'UPDATE CUSTOMER DETAILS' : 'NEW CUSTOMER REGISTRATION'}
              </span>
            </div>

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center shadow-sm animate-in fade-in duration-300">
                <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0 text-emerald-500" />
                <span className="font-bold text-sm uppercase tracking-tight">Customer {editingCustomer ? 'updated' : 'registered'} successfully!</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center shadow-sm animate-in shake duration-500">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-rose-500" />
                <span className="font-bold text-sm uppercase tracking-tight text-rose-700">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Row 1 */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold text-gray-700">Customer Number (Auto-Generated)</label>
                <input
                  type="text"
                  disabled
                  value={editingCustomer?.customer_number || nextCustomerNumber}
                  className="bg-gray-100 border border-gray-300 px-3 py-2 text-gray-700 font-bold focus:outline-none"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold text-gray-700">Customer Type</label>
                <select
                  name="customer_type"
                  value={formData.customer_type}
                  onChange={handleInputChange}
                  className="bg-[#f0f9ff] border-2 border-slate-300 px-3 py-2 rounded-lg text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all"
                >
                  <option value="">-- Select Type --</option>
                  {customerTypes.map(t => (
                    <option key={t.customer_type_number} value={t.customer_type_number}>
                      {t.customer_type_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2 - Triple Column (Simulated with grid in md:grid-cols-2) */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="bg-[#f0f9ff] border-2 border-slate-300 px-3 py-2 rounded-lg text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Middle Name</label>
                  <input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleInputChange}
                    className="bg-[#f0f9ff] border-2 border-slate-300 px-3 py-2 rounded-lg text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Surname</label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    className="bg-[#f0f9ff] border-2 border-slate-300 px-3 py-2 rounded-lg text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="bg-[#f0f9ff] border-2 border-slate-300 px-3 py-2 rounded-lg text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Ghana Card Number</label>
                <input
                  type="text"
                  name="ghana_card_number"
                  value={formData.ghana_card_number}
                  onChange={handleInputChange}
                  placeholder="GHA-XXXXXXX-X"
                  className="bg-[#f0f9ff] border-2 border-slate-300 px-3 py-2 rounded-lg text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Row 4 */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="bg-[#f0f9ff] border-2 border-slate-300 px-3 py-2 rounded-lg text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="bg-[#f0f9ff] border-2 border-slate-300 px-3 py-2 rounded-lg text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Row 5 */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="bg-[#f0f9ff] border-2 border-slate-300 px-3 py-2 rounded-lg text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Mobile Banker</label>
                <input
                  type="text"
                  name="mobile_banker"
                  value={formData.mobile_banker}
                  onChange={handleInputChange}
                  className="bg-[#f0f9ff] border-2 border-slate-300 px-3 py-2 rounded-lg text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Photo Section */}
              <div className="md:col-span-2 pt-4">
                <div className="flex items-start space-x-6">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50 overflow-hidden relative"
                  >
                    {previewUrl ? (
                      <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    ) : (
                      <>
                        <Plus className="w-8 h-8 text-gray-400" />
                        <span className="text-[10px] uppercase font-bold text-gray-400 mt-1">Photo</span>
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-700">Passport Photo</h3>
                    <p className="text-xs text-gray-500 mt-1">Upload a clear passport-sized photo for identification.</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300 transition-colors"
                    >
                      CHOOSE FILE
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 pt-6 flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#28a745] text-white px-8 py-3 font-bold hover:bg-[#218838] transition-colors flex items-center shadow-sm"
                >
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {editingCustomer ? 'UPDATE CUSTOMER' : 'REGISTER CUSTOMER'}
                </button>
                {editingCustomer && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white px-8 py-3 font-bold hover:bg-gray-600 transition-colors shadow-sm"
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="max-w-7xl">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f0f9ff] border-2 border-slate-300 rounded-xl text-sm font-black text-slate-950 focus:border-[#28a745] focus:bg-white focus:ring-4 focus:ring-[#28a745]/10 focus:outline-none transition-all placeholder:text-slate-500 shadow-inner"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Number</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Agent</th>
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((c) => (
                    <tr key={c.customer_number} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-gray-700">{c.customer_number}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-gray-100 flex-shrink-0 relative overflow-hidden">
                            {c.passport_photo ? (
                              <Image src={c.passport_photo} alt="" fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                                {c.first_name[0]}{c.surname[0]}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-bold text-gray-800">{c.first_name} {c.surname}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.phone_number}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase">
                          {c.customer_type_name || 'Standard'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{c.mobile_banker || 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.customer_number)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="py-20 text-center text-gray-400">
                  <p>No customers found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



