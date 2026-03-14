import Link from 'next/link';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-3xl mb-3">{icon}</span>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
