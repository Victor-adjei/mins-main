'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Wallet, 
  Repeat, 
  History, 
  HandHelping,
  FileBarChart,
  Users2,
  Lock,
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const isAdmin = role === 'Admin';
  const isStaff = role === 'Staff';
  const isFieldOfficer = role === 'Field Officer';

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { 
      name: 'Manage Users', 
      href: '/users', 
      icon: ShieldCheck, 
      show: isAdmin 
    },
    { name: 'Customer', href: '/customers', icon: Users },
    { 
      name: 'Customer Type', 
      href: '/customer-types', 
      icon: Users2, 
      show: isAdmin || isStaff 
    },
    { 
      name: 'Account Types', 
      href: '/account-types', 
      icon: Wallet, 
      show: isAdmin || isStaff 
    },
    { name: 'Accounts', href: '/accounts', icon: Lock },
    { 
      name: 'Account Status', 
      href: '/account-status', 
      icon: Settings, 
      show: isAdmin || isStaff 
    },
    { name: 'Transactions', href: '/transactions', icon: Repeat },
    { 
      name: 'Financial Summary', 
      href: '/financial-summary', 
      icon: FileBarChart, 
      show: !isFieldOfficer 
    },
    { name: 'Apply Loan', href: '/loans', icon: HandHelping },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-2xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
            E
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">EYE ADOM</h2>
            <p className="text-xs text-slate-400 font-medium tracking-wider">SUSU & SAVINGS</p>
          </div>
        </div>

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
                    ? "bg-emerald-600/10 text-emerald-400 font-semibold" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white"
                )} />
                <span className="text-sm">{item.name}</span>
                {isActive && (
                  <div className="absolute right-2 w-1 h-5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 px-6">
        {!isFieldOfficer && (
          <>
            <h3 className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Reports</h3>
            <Link
              href="/reports/ledger"
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                pathname === '/reports/ledger' 
                  ? "bg-emerald-600/10 text-emerald-400 font-semibold" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <History className="w-5 h-5" />
              <span className="text-sm text-center">Transaction Ledger</span>
            </Link>
          </>
        )}
      </div>

      <div className="mt-auto p-6 border-t border-slate-800/50">
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xs font-bold">
               {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
               <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{role}</p>
             </div>
          </div>
        </div>
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 font-semibold mt-auto"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
