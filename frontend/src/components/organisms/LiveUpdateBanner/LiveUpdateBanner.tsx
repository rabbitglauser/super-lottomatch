import { LIVE_UPDATE } from "@/lib/dashboard-mock";

export default function LiveUpdateBanner() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#12131A] via-[#1A1823] to-[#1E1B2D] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]">
      <svg
        aria-hidden
        viewBox="0 0 600 220"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="spotlight" cx="0.75" cy="0.2" r="0.55">
            <stop offset="0%" stopColor="#DF2634" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#6B1A28" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#12131A" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="spotlight-2" cx="0.9" cy="0.05" r="0.4">
            <stop offset="0%" stopColor="#F1D1A5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#12131A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="600" height="220" fill="url(#spotlight)" />
        <rect width="600" height="220" fill="url(#spotlight-2)" />
      </svg>

      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />

      <div className="relative flex h-full flex-col justify-end p-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-accent-red uppercase">
          {LIVE_UPDATE.label}
        </p>
        <p className="mt-3 max-w-xl text-2xl font-semibold leading-snug text-white sm:text-3xl">
          {LIVE_UPDATE.message}
        </p>
      </div>
    </div>
  );
}
