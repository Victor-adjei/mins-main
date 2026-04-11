'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-[#00c58d] rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-[#00c58d]/20">
              E
            </div>
          </div>
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-[#0b1424] leading-tight tracking-tighter uppercase">
              EYE ADOM
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">SUSU & SAVINGS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-black uppercase tracking-tight border border-red-100 flex items-center shadow-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest pl-1">
                Username Identifier
              </label>
              <input spellCheck={false}
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-[#f0f9ff] border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10 transition-all outline-none shadow-sm text-sm"
                placeholder="Type your username..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest pl-1">
                Secure Password
              </label>
              <input spellCheck={false}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-[#f0f9ff] border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-[#0066cc] focus:ring-4 focus:ring-[#0066cc]/10 transition-all outline-none shadow-sm text-sm"
                placeholder="Type your password..."
                required
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer w-5 h-5 rounded-lg border-2 border-slate-300 text-[#0066cc] focus:ring-0 checked:bg-[#0066cc] cursor-pointer appearance-none transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Stay logged in</span>
              </label>
              <a href="#" className="text-[10px] font-black text-[#0066cc] uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
                Recovery
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0b1424] hover:bg-[#1a2b4a] text-white font-black py-5 px-4 rounded-2xl shadow-xl shadow-black/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>AUTHENTICATE</span>
                  <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 py-6 text-center border-t border-slate-100">
           <button className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-[#0b1424] transition-colors">
             &copy; 2026 EYE ADOM MIMS
           </button>
        </div>
      </div>
    </div>
  );
}
