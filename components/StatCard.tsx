import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  href: string;
}

export default function StatCard({ title, value, icon: Icon, color, href }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-opacity-10 ${color} transition-transform group-hover:scale-110`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <a 
          href={href} 
          className="text-xs font-bold text-slate-400 hover:text-emerald-500 flex items-center transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50"
        >
          View More
        </a>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
}
