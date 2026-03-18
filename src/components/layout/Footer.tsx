export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-[9px] tracking-tight shadow-sm">
              FFA
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 tracking-tight">FFA Advantage Portal</p>
              <p className="text-xs text-neutral-500">Florida Financial Advisors</p>
            </div>
          </div>

          {/* Center info */}
          <p className="text-[11px] text-neutral-400 tracking-wide">
            Powered by AI &bull; FINRA Compliant
          </p>

          {/* Copyright */}
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Florida Financial Advisors. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
