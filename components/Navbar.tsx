'use client';

import { useSession } from 'next-auth/react';
import { Bell, Search, Menu, User } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-4">
        <button className="lg:hidden text-slate-500">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative hidden md:block group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-xl text-sm w-64 transition-all outline-none" 
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-100"></div>

        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-emerald-600 transition-colors">{session?.user?.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{session?.user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
