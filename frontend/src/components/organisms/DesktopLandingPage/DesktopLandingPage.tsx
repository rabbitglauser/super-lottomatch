import { GLSLHills } from "@/components/glsl-hills";

export default function DesktopLandingPage() {
  return (
    <main className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#f5f2f2]">
      <div className="absolute inset-0 z-0">
        <GLSLHills width="100%" height="100%" cameraZ={115} speed={0.5} />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 py-14 sm:px-10 md:py-18 lg:px-16">
        <div className="mx-auto max-w-5xl space-y-5 text-center text-charcoal sm:space-y-6">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.38em] text-charcoal/40 sm:text-[0.72rem] sm:tracking-[0.42em]">
            SuperLottomatch
          </p>

          <h1 className="font-semibold text-4xl leading-[0.96] tracking-[-0.05em] sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block text-3xl font-thin italic tracking-[-0.04em] sm:text-4xl md:text-5xl lg:text-6xl">
              Events That Feel <br />
            </span>
            <span className="block text-balance">
              Bigger Than Spreadsheets
            </span>
          </h1>

          <p className="mx-auto max-w-[21rem] text-sm leading-7 text-charcoal/65 sm:max-w-xl sm:text-base md:max-w-2xl">
            SuperLottomatch brings guest management, imports, check-ins and
            prize moments into one polished event flow that feels clear, fast
            and memorable.
          </p>
        </div>
      </div>
    </main>
  );
}
