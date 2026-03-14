'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePortal } from '@/lib/context/PortalContext';
import { Menu, X, Settings } from 'lucide-react';
import type { WarmLeadTier } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
}

const mainNav: NavItem[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/audience', label: 'Audience' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/content', label: 'Content' },
  { href: '/warm-leads', label: 'Warm Leads' },
];

const settingsNav: NavItem[] = [
  { href: '/guide', label: 'How It Works' },
  { href: '/settings', label: 'Settings' },
];

export default function TopNav() {
  const pathname = usePathname();
  const { contacts, activities } = usePortal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setSettingsOpen(false);
  }, [pathname]);

  // Close settings dropdown on outside click
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = () => setSettingsOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [settingsOpen]);

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

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-14 bg-white border-b border-neutral-200 z-50 items-center px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-10 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-black text-[9px] tracking-tight">
            FFA
          </div>
          <span className="text-sm font-semibold text-neutral-900 tracking-tight">Advantage</span>
        </Link>

        {/* Main nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive(item.href)
                  ? 'text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {item.label}
              {item.href === '/warm-leads' && warmLeadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                  {warmLeadCount}
                </span>
              )}
              {isActive(item.href) && (
                <span className="absolute bottom-[-9px] left-3 right-3 h-[2px] bg-indigo-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side: settings + user */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setSettingsOpen(!settingsOpen); }}
              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                settingsOpen || isActive('/settings') || isActive('/guide')
                  ? 'text-neutral-900 bg-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 animate-fade-in">
                {settingsNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 text-sm transition-colors ${
                      isActive(item.href)
                        ? 'text-neutral-900 bg-neutral-50 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white">
            NM
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-neutral-200 z-50 flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-md bg-neutral-50 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-neutral-900 flex items-center justify-center text-white font-black text-[8px]">
            FFA
          </div>
          <span className="text-sm font-semibold text-neutral-900">Advantage</span>
        </Link>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-[60] animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-[70] border-b border-neutral-200 animate-slide-up shadow-lg">
          <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-100">
            <span className="text-sm font-semibold text-neutral-900">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-500 hover:bg-neutral-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="p-2">
            {[...mainNav, ...settingsNav].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2.5 text-sm rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'text-neutral-900 bg-neutral-50 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span className="flex items-center justify-between">
                  {item.label}
                  {item.href === '/warm-leads' && warmLeadCount > 0 && (
                    <span className="min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                      {warmLeadCount}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
