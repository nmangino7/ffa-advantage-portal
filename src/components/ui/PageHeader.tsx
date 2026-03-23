import React from 'react';
import Link from 'next/link';

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
  gradient,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
  gradient?: boolean;
}) {
  return (
    <div className="mb-8 animate-fade-up" style={{ animationDuration: '0.35s' }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400 mb-3">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-neutral-600 transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-neutral-500">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-semibold tracking-tight ${gradient ? 'text-gradient' : 'text-neutral-900'}`}>
            {title}
          </h1>
          {subtitle && <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
