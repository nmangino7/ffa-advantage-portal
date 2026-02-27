'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePortal } from '@/lib/context/PortalContext';
import { Icon } from '@/components/ui/Icon';
import { Menu, X } from 'lucide-react';
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
      { href: '/content', label: 'Content Library', icon: 'book-open' },
      { href: '/campaigns', label: 'Campaigns', icon: 'megaphone' },
      { href: '/audience', label: 'Audience', icon: 'users' },
    ],
  },
  {
    label: 'CONVERT',
    items: [
      { href: '/warm-leads', label: 'Warm Leads', icon: 'flame', badge: true },
      { href: '/pipeline', label: 'Pipeline', icon: 'trending-up' },
    ],
  },
  {
    label: 'LEARN',
    items: [
      { href: '/guide', label: 'How It Works', icon: 'help-circle' },
      { href: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { contacts, activities } = usePortal();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
            FFA
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white leading-tight">The Advantage</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Outreach Platform</p>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-4 border-t border-slate-800/60 mb-2" />

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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border-l-[3px] border-blue-400 ml-0 pl-[9px]'
                        : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 hover:translate-x-0.5'}`}>
                    <Icon name={item.icon} className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && warmLeadCount > 0 && (
                      <span className="min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 animate-pulse-badge">
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
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">NM</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0c1222]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-white leading-tight">Nick Mangino</p>
            <p className="text-[10px] text-slate-500">FFA North</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0c1222] z-50 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-[10px]">
          FFA
        </div>
        <span className="text-sm font-bold text-white">The Advantage</span>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[60] animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-[280px] bg-[#0c1222] text-slate-300 flex flex-col z-[70] transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[240px] bg-[#0c1222] text-slate-300 flex-col z-50">
        {sidebarContent}
      </aside>
    </>
  );
}
