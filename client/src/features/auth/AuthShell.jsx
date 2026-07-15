import { Sparkles, ShieldCheck, Lock, Globe } from 'lucide-react';

// Split-screen auth layout: brand panel + form card.
export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 overflow-hidden px-4 py-10 sm:px-6 lg:grid-cols-2">
      {/* ambient halos behind everything (kept inside the clip so no hard edges) */}
      <div className="pointer-events-none absolute top-6 right-10 -z-10 h-80 w-80 animate-drift rounded-blob bg-brand-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 left-6 -z-10 h-72 w-72 animate-drift rounded-blob bg-gold/15 blur-3xl [animation-delay:-8s]" />

      <div className="relative hidden overflow-hidden rounded-4xl bg-brand-950 p-10 text-white shadow-float lg:block">
        <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 animate-drift rounded-blob bg-brand-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-4 h-56 w-56 animate-drift rounded-blob bg-gold/20 blur-3xl [animation-delay:-11s]" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600"><Sparkles size={18} /></span>
            <span className="font-display text-xl font-semibold">SIRUS</span>
          </div>
          <h2 className="mt-10 font-display text-4xl font-semibold leading-tight text-balance">
            Compliance-ready minutes, <em className="serif-accent text-gold">generated in minutes</em>.
          </h2>
          <p className="mt-4 text-brand-200">From raw transcript to a signed, audit-ready procès-verbal — with an AI compliance score you can trust.</p>
          <div className="mt-10 space-y-4">
            {[[ShieldCheck, 'Full compliance audit against your regulation'], [Lock, 'Encrypted storage & audit trail'], [Globe, 'Multilingual, region-aware reports']].map(([Icon, text]) => (
              <div key={text} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-card/10"><Icon size={18} /></span>
                <span className="text-sm text-brand-100">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md animate-fade-up">
        <div className="rounded-4xl bg-card p-8 shadow-card ring-1 ring-ink/5">
          <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
