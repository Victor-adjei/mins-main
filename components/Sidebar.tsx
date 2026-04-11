'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Repeat, 
  History, 
  HandHelping,
  FileBarChart,
  Users2,
  Settings,
  ShieldCheck,
  LogOut,
  CreditCard,
  X,
  Menu
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useSidebar } from '@/context/SidebarContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const isAdmin = role === 'Admin';
  const isStaff = role === 'Staff';
  const isFieldOfficer = role === 'Field Officer';

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Manage Users', href: '/users', icon: ShieldCheck, show: isAdmin },
    { name: 'Customer', href: '/customers', icon: Users },
    { name: 'Customer Type', href: '/customer-types', icon: Users2, show: isAdmin || isStaff },
    { name: 'Account Types', href: '/account-types', icon: Wallet, show: isAdmin || isStaff },
    { name: 'Accounts', href: '/accounts', icon: CreditCard },
    { name: 'Account Status', href: '/account-status', icon: Settings, show: isAdmin || isStaff },
    { name: 'Transactions', href: '/transactions', icon: Repeat },
    { name: 'Financial Summary', href: '/financial-summary', icon: FileBarChart, show: !isFieldOfficer },
    { name: 'Apply Loan', href: '/loans', icon: HandHelping },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0b1727] text-slate-300 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0b1727] sticky top-0 z-10 h-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00c58d] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#00c58d]/20">
              E
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-lg text-white leading-none tracking-tight">EYE ADOM</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-wider uppercase">SUSU & SAVINGS</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto pt-6 px-4 custom-scrollbar">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              if (item.show === false) return null;
              
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-400 font-bold" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-emerald-400"
                  )} />
                  <span className="text-sm font-bold uppercase tracking-widest text-[11px]">{item.name}</span>
                  {isActive && (
                    <div className="absolute right-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-l-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 px-4">
            {(isAdmin || isStaff || isFieldOfficer) && (
              <>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 pl-1">REPORTS</h3>
                <Link
                  href={isFieldOfficer ? "/reports/callover" : "/reports/ledger"}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    (pathname === '/reports/ledger' || pathname === '/reports/callover') 
                      ? "bg-emerald-500/10 text-emerald-400 font-bold" 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <History className="w-5 h-5 text-slate-500 group-hover:text-emerald-400" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    {isFieldOfficer ? "Callover Report" : "Transaction Ledger"}
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* User profile footer */}
        <div className="mt-auto p-4 border-t border-white/5 bg-[#0b1727]/50">
          <div className="bg-white/5 rounded-2xl p-4 mb-4">
            <div className="flex items-center space-x-3">
               <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-[#0b1424] text-sm font-black shadow-lg shadow-emerald-500/10">
                 {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-black text-white truncate uppercase tracking-tighter">{session?.user?.name}</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">{role}</p>
               </div>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/5 group"
          >
            <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </>
  );
}
