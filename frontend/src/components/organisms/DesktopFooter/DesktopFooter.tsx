import Link from "next/link";
import { cn } from "@/lib/utils";

interface DesktopFooterProps {
  className?: string;
}

export default function DesktopFooter({ className }: DesktopFooterProps) {
  return (
    <footer className={cn(className)}>
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-2 px-6 py-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-footer sm:flex-row sm:flex-wrap sm:gap-5 sm:py-4 sm:text-xs lg:text-[0.72rem]">
        <span>&copy; 2026 SuperLottoMatch</span>

        <Link href="/impressum" className="transition hover:text-heading">
          Impressum
        </Link>

        <Link href="/datenschutz" className="transition hover:text-heading">
          Datenschutz
        </Link>
      </div>
    </footer>
  );
}
