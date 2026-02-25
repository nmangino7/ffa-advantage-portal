'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/pipeline', label: 'Pipeline', icon: '🔄' },
  { href: '/campaigns', label: 'Campaigns', icon: '📧' },
  { href: '/contacts', label: 'Contacts', icon: '👥' },
  { href: '/roadmap', label: 'Roadmap', icon: '📋' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#0c1222] text-slate-300 flex flex-col z-50">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-sm">
            FFA
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white leading-tight">The Advantage</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Outreach Platform</p>
          </div>
        </div>
      </div>

      <div className="px-3 mb-2"><div className="h-px bg-slate-800" /></div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'}`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mb-2"><div className="h-px bg-slate-800" /></div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">NM</div>
          <div>
            <p className="text-[13px] font-medium text-white leading-tight">Nick Mangino</p>
            <p className="text-[10px] text-slate-500">FFA North</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
