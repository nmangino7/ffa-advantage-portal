'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePortal } from '@/lib/context/PortalContext';
import type { WarmLeadTier } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: boolean;
}

interface NavSection {
  label: string | null;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: null,
    items: [
      { href: '/', label: 'Home', icon: 'home' },
    ],
  },
  {
    label: 'OUTREACH',
    items: [
      { href: '/content', label: 'Content Library', icon: 'book' },
      { href: '/campaigns', label: 'Campaigns', icon: 'megaphone' },
      { href: '/audience', label: 'Audience', icon: 'users' },
    ],
  },
  {
    label: 'CONVERT',
    items: [
      { href: '/warm-leads', label: 'Warm Leads', icon: 'fire', badge: true },
      { href: '/pipeline', label: 'Pipeline', icon: 'trending' },
    ],
  },
  {
    label: 'LEARN',
    items: [
      { href: '/guide', label: 'How It Works', icon: 'guide' },
      { href: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

function NavIcon({ name, className }: { name: string; className?: string }) {
  const c = className || 'w-4 h-4';
  const props = { className: c, fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: 1.8 };
  switch (name) {
    case 'home': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
    case 'book': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
    case 'megaphone': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H6.75a1.5 1.5 0 01-1.5-1.5V10.5a1.5 1.5 0 011.5-1.5h1.5c.704 0 1.402-.03 2.09-.09m0 6.93c.426.04.855.064 1.29.077m-1.29-.077l5.223 3.14A1.125 1.125 0 0017.25 18V6.75a1.125 1.125 0 00-1.688-.978l-5.223 3.14m0 6.93A11.94 11.94 0 0112 13.5c0-1.09-.148-2.147-.422-3.148m0 0c1.752-.13 3.446-.487 5.048-1.048" /></svg>;
    case 'users': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
    case 'fire': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg>;
    case 'trending': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
    case 'guide': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>;
    case 'settings': return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    default: return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const { contacts, activities } = usePortal();

  // Compute warm lead count reactively from context
  const warmLeadCount = useMemo(() => {
    const highValueTypes: Record<string, WarmLeadTier> = {
      'reply_received': 'replied',
      'info_requested': 'info_requested',
      'appointment_scheduled': 'replied',
    };
    const seen = new Set<string>();
    let unassigned = 0;

    for (const act of activities) {
      if (!highValueTypes[act.type]) continue;
      if (seen.has(act.contactId)) continue;
      seen.add(act.contactId);
      const contact = contacts.find(c => c.id === act.contactId);
      if (contact && !contact.assignedRep) unassigned++;
    }

    // Also count engaged (clicked + high intent) contacts
    for (const act of activities) {
      if (act.type !== 'email_clicked') continue;
      if (seen.has(act.contactId)) continue;
      const contact = contacts.find(c => c.id === act.contactId);
      if (!contact || contact.intentScore < 30) continue;
      seen.add(act.contactId);
      if (!contact.assignedRep) unassigned++;
    }

    return unassigned;
  }, [contacts, activities]);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-[#0c1222] text-slate-300 flex flex-col z-50">
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-5' : ''}>
            {section.label && (
              <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest px-3 mb-2">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border-l-[3px] border-blue-400 ml-0 pl-[9px]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                    <NavIcon name={item.icon} className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && warmLeadCount > 0 && (
                      <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5">
                        {warmLeadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 px-4 py-4">
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
