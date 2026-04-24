import Link from "next/link";
import { cn } from "@/lib/utils";

interface DesktopFooterProps {
  absolute?: boolean;
  className?: string;
}

export default function DesktopFooter({
  absolute = false,
  className,
}: DesktopFooterProps) {
  return (
    <footer
      className={cn(
        absolute && "lg:absolute lg:inset-x-0 lg:bottom-0",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-3 px-6 py-5 text-center text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-footer sm:flex-row sm:flex-wrap sm:gap-6 sm:text-sm">
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
