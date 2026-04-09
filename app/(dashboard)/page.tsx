'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users2, Wallet, Users, LayoutDashboard, Loader2 } from 'lucide-react';
import StatCard from '@/components/StatCard';

interface DashboardStats {
  customerTypes: number;
  accountTypes: number;
  totalCustomers: number;
  totalAccounts: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const isAdminOrStaff = session?.user?.role === 'Admin' || session?.user?.role === 'Staff';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {session?.user?.name}!</h1>
        <p className="text-slate-500 font-medium mt-1">Here's what's happening today at Eye Adom.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdminOrStaff && (
          <>
            <StatCard 
              title="Customer Types" 
              value={stats?.customerTypes || 0} 
              icon={Users2} 
              color="bg-sky-500" 
              href="/customer-types"
            />
            <StatCard 
              title="Account Types" 
              value={stats?.accountTypes || 0} 
              icon={Wallet} 
              color="bg-emerald-500" 
              href="/account-types"
            />
          </>
        )}
        <StatCard 
          title="Total Customers" 
          value={stats?.totalCustomers || 0} 
          icon={Users} 
          color="bg-amber-500" 
          href="/customers"
        />
        <StatCard 
          title="Total Accounts" 
          value={stats?.totalAccounts || 0} 
          icon={LayoutDashboard} 
          color="bg-rose-500" 
          href="/accounts"
        />
      </div>

      {/* Decorative Chart Placeholder for now */}
      <div className="mt-10 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
         <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-xl font-bold text-slate-900">Activity Overview</h2>
             <p className="text-sm text-slate-400 font-medium tracking-wide uppercase mt-1">Real-time statistics</p>
           </div>
           <div className="flex space-x-2">
             <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">Weekly</div>
             <div className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-xs font-bold border border-slate-100">Monthly</div>
           </div>
         </div>
         
         <div className="h-64 flex items-end space-x-4">
            {[40, 70, 45, 90, 65, 80, 55, 75, 50, 85, 60, 95].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-slate-50 rounded-t-xl relative group/bar hover:bg-emerald-50 transition-colors cursor-pointer"
                style={{ height: `${h}%` }}
              >
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-500/20 to-transparent h-1/2 rounded-t-xl opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
              </div>
            ))}
         </div>
         
         <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"></div>
      </div>
    </div>
  );
}
