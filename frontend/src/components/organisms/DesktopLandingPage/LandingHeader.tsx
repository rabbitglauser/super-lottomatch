import Link from "next/link";

function BrandMark() {
  return (
    <span
      className="inline-flex size-10 items-center justify-center text-accent-red sm:size-11"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full"
      >
        <path
          d="M30.55 6.5C24.86 6.5 20.14 10.6 20.14 15.67C20.14 19.53 22.82 22.18 28.1 23.86C32.4 25.23 34.03 26.52 34.03 28.75C34.03 31.5 31.3 33.68 27.32 33.68C23.79 33.68 20.92 32.39 17.93 29.42L11.9 35.4C15.98 39.6 21.19 41.5 27.1 41.5C36.34 41.5 42.1 36.27 42.1 28.13C42.1 21.95 38.92 18.5 31.67 16.18C27.78 14.94 26.03 13.94 26.03 12.11C26.03 10.13 27.91 8.72 30.63 8.72C33.08 8.72 35.24 9.52 37.66 11.74L41.68 6.61C38.39 3.85 34.8 2.5 30.55 2.5C22.36 2.5 16.37 7.52 16.37 14.92C16.37 19.98 19.3 23.27 25.53 25.27C30.52 26.87 32.15 27.92 32.15 30.36C32.15 33.07 29.85 35.28 25.99 35.28C21.88 35.28 18.43 33.56 15.18 30.08L2.6 17.1L7.72 11.97L15.38 19.74C16.61 12.44 22.4 6.5 30.55 6.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[1.02rem] font-medium text-charcoal transition-colors duration-200 hover:text-accent-red"
    >
      {children}
    </Link>
  );
}

export default function LandingHeader() {
  return (
    <header className="relative z-20 w-full">
      <div className="mx-auto flex h-24 w-full max-w-[1500px] items-center justify-between px-6 sm:px-10 lg:px-14 xl:px-16">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-charcoal transition-opacity duration-200 hover:opacity-90"
        >
          <BrandMark />
          <span className="text-xl font-semibold tracking-[-0.03em] sm:text-[1.4rem]">
            STV Events
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-5 lg:gap-7">
          <nav className="hidden items-center gap-7 lg:flex xl:gap-10">
            <NavLink href="/#features">Features</NavLink>
            <NavLink href="/mobile">Mobile</NavLink>
            <NavLink href="/desktop">Desktop</NavLink>
          </nav>

          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#f2dede] bg-[#fff4f4] px-5 text-sm font-semibold text-accent-red shadow-[0_10px_24px_rgba(223,38,52,0.08)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffecec] hover:shadow-[0_16px_28px_rgba(223,38,52,0.12)] sm:px-6 sm:text-base"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
