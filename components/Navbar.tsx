'use client';

import { useSession } from 'next-auth/react';
import { Bell, Search, Menu, User } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

export default function Navbar() {
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="h-20 bg-[#0066cc] flex items-center justify-between px-6 sticky top-0 z-30 shadow-xl border-b border-white/10">
      <div className="flex items-center space-x-6">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 shadow-lg border border-white/20"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative hidden lg:block group">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Universal Search..." 
            className="pl-12 pr-6 py-3.5 bg-white/10 border-2 border-transparent focus:bg-white/20 focus:border-white/10 rounded-2xl text-sm w-80 transition-all outline-none text-white placeholder:text-white/40 font-bold tracking-tight shadow-inner" 
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-8">
        <button className="relative h-12 w-12 flex items-center justify-center rounded-2xl bg-white/10 text-white/70 hover:text-white transition-all hover:shadow-lg border border-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0066cc] animate-pulse"></span>
        </button>
        
        <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>

        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className="text-right hidden md:block group-hover:translate-x-[-4px] transition-transform">
            <p className="text-sm font-black text-white leading-none uppercase tracking-tighter">{session?.user?.name}</p>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1 text-right">{session?.user?.role}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20 group-hover:scale-110 transition-transform shadow-lg shadow-black/10 overflow-hidden">
             {session?.user?.image ? (
               <img src={session.user.image} alt="" className="w-full h-full object-cover" />
             ) : (
               <User className="w-6 h-6 text-white" />
             )}
          </div>
        </div>
      </div>
    </header>
  );
}
