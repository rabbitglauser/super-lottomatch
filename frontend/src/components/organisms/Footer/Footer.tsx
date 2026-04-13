import Link from "next/link";

export default function Footer() {
  return (
    <footer className="absolute inset-x-0 bottom-0">
      <div className="mx-auto flex h-16 items-center justify-center gap-8 text-sm font-semibold uppercase tracking-[0.18em] text-footer">
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
