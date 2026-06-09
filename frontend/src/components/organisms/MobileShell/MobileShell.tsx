import Link from "next/link";
import type { ReactNode } from "react";
import {
  Bell,
  Calendar,
  CircleUser,
  QrCode,
  Search,
  UserPlus,
} from "lucide-react";

type ActiveTab = "home" | "checkin" | "search" | "new";

export function MobileShell({
  children,
  activeTab,
}: {
  children: ReactNode;
  activeTab: ActiveTab;
}) {
  return (
    <main className="min-h-screen bg-[#f6eeee] text-[#231f20]">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#f8f1f2] shadow-[0_30px_80px_rgba(42,23,23,0.12)]">
        {children}
        <MobileBottomNavigation activeTab={activeTab} />
      </div>
    </main>
  );
}

export function MobileHeader({
  title = "STV Event Manager",
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#eadada] bg-white/90 px-6 py-5 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-extrabold tracking-[-0.03em] text-[#c9182b]">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#7b6b6d]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 text-[#5b484b]">
        <Bell size={21} />
        <CircleUser size={24} />
      </div>
    </header>
  );
}

export function MobileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.4rem] border border-[#eadada] bg-white shadow-[0_18px_40px_rgba(42,23,23,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export function MobileRedButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex h-16 items-center justify-center gap-3 rounded-[1.1rem] bg-gradient-to-r from-[#df2634] to-[#b90f1d] px-5 text-lg font-extrabold text-white shadow-[0_18px_34px_rgba(220,31,45,0.22)] transition active:scale-[0.98]"
    >
      {children}
    </Link>
  );
}

export function MobileWhiteButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex h-16 items-center justify-center gap-3 rounded-[1.1rem] border border-[#eadada] bg-white px-5 text-lg font-extrabold text-[#c9182b] shadow-[0_14px_28px_rgba(42,23,23,0.05)] transition active:scale-[0.98]"
    >
      {children}
    </Link>
  );
}

function MobileBottomNavigation({ activeTab }: { activeTab: ActiveTab }) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-50 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[#eadada] bg-white/95 px-3 py-3 backdrop-blur-md">
      <BottomNavItem
        href="/mobile"
        icon={<Calendar size={22} />}
        label="HEUTE"
        active={activeTab === "home"}
      />

      <BottomNavItem
        href="/mobile/scanner"
        icon={<QrCode size={22} />}
        label="CHECK-IN"
        active={activeTab === "checkin"}
      />

      <BottomNavItem
        href="/mobile/search"
        icon={<Search size={22} />}
        label="SUCHEN"
        active={activeTab === "search"}
      />

      <BottomNavItem
        href="/mobile/register"
        icon={<UserPlus size={22} />}
        label="NEUER GAST"
        active={activeTab === "new"}
      />
    </nav>
  );
}

function BottomNavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center rounded-[1rem] px-2 py-2 text-center text-[10px] font-extrabold tracking-[0.08em] transition ${
        active
          ? "bg-[#ffe4e7] text-[#df2634]"
          : "text-[#9b8b8d] active:text-[#df2634]"
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </Link>
  );
}