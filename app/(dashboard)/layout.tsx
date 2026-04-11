import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '@/context/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-slate-50 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <Navbar />
            <main className="flex-1 p-4 overflow-y-auto bg-[#f8fafc]">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SessionProvider>
  );
}
