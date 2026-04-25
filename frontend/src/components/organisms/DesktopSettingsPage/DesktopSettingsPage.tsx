"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bell,
  Camera,
  Check,
  ChevronDown,
  ClipboardList,
  Cloud,
  CloudOff,
  FileSpreadsheet,
  Info,
  Lock,
  Mail,
  MonitorSmartphone,
  Pencil,
  Radio,
  RotateCcw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import PageReveal from "@/components/atoms/PageReveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GeneralSettingsState = {
  language: string;
  timezone: string;
  currency: string;
  eventType: string;
};

type NotificationSettingsState = {
  emailUpdates: boolean;
  liveCheckin: boolean;
  newImports: boolean;
  reportSummary: boolean;
};

type QuickStatusRecord = {
  icon: LucideIcon;
  label: string;
  status: string;
};

type IntegrationRecord = {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  connected: boolean;
};

const DEFAULT_GENERAL_SETTINGS: GeneralSettingsState = {
  language: "Deutsch",
  timezone: "Europe/Zurich",
  currency: "CHF",
  eventType: "Lottomatch",
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsState = {
  emailUpdates: true,
  liveCheckin: true,
  newImports: false,
  reportSummary: true,
};

const QUICK_STATUSES: QuickStatusRecord[] = [
  {
    icon: ShieldCheck,
    label: "2FA aktiviert",
    status: "Aktiv",
  },
  {
    icon: Bell,
    label: "Benachrichtigungen aktiv",
    status: "Aktiv",
  },
  {
    icon: Cloud,
    label: "Automatische Backups aktiv",
    status: "Aktiv",
  },
];

const INTEGRATIONS: IntegrationRecord[] = [
  {
    key: "excel",
    icon: FileSpreadsheet,
    title: "Excel / CSV Import",
    description: "Importieren Sie Gäste und Daten.",
    connected: true,
  },
  {
    key: "outlook",
    icon: Mail,
    title: "Outlook Kontakte",
    description: "Synchronisieren Sie Kontakte.",
    connected: false,
  },
  {
    key: "google-sheets",
    icon: FileSpreadsheet,
    title: "Google Sheets",
    description: "Exportieren Sie Daten und Reports.",
    connected: true,
  },
];

const surfaceClassName =
  "min-w-0 rounded-[28px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(116,82,82,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(116,82,82,0.11)]";

function SurfaceCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <section className={cn(surfaceClassName, className)}>{children}</section>;
}

function HeaderButton({
  icon: Icon,
  children,
  variant,
  onClick,
}: {
  icon: LucideIcon;
  children: ReactNode;
  variant: "primary" | "secondary";
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "h-[52px] rounded-xl px-4 text-sm font-semibold shadow-[0_14px_30px_rgba(31,29,29,0.05)] sm:px-5 sm:text-base",
        variant === "primary"
          ? "w-full border-transparent bg-[linear-gradient(135deg,#df2634_0%,#b80012_100%)] text-white shadow-[0_18px_34px_rgba(223,38,52,0.24)] hover:opacity-95 sm:w-auto"
          : "w-full border-[#eadede] bg-white text-charcoal hover:bg-[#fff7f7] sm:w-auto",
      )}
    >
      <Icon className={cn("size-4 sm:size-5", variant === "primary" ? "text-white" : "text-accent-red")} />
      {children}
    </Button>
  );
}

function CardTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight text-charcoal">
        {title}
      </h2>
      {action}
    </div>
  );
}

function ProfileInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-muted-warm">{label}</span>
      <span className="text-right text-sm font-semibold text-charcoal">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({
  tone,
  label,
}: {
  tone: "green" | "red";
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
        tone === "green"
          ? "bg-[#eaf7ee] text-[#15803d]"
          : "bg-[#fde6e6] text-accent-red",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          tone === "green" ? "bg-[#16a34a]" : "bg-accent-red",
        )}
      />
      {label}
    </span>
  );
}

function SettingsSelectRow({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#f0e4e4] py-4 last:border-b-0 last:pb-0 first:pt-0 lg:flex-row lg:items-center lg:justify-between">
      <label
        htmlFor={id}
        className="text-sm font-medium text-charcoal"
      >
        {label}
      </label>

      <div className="relative w-full lg:max-w-[420px]">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-[46px] w-full appearance-none rounded-xl border border-[#eadede] bg-[#fffdfd] px-4 pr-10 text-sm font-medium text-charcoal shadow-[0_10px_24px_rgba(31,29,29,0.04)] outline-none transition focus:border-accent-red/25 focus:ring-4 focus:ring-accent-red/10"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-warm" />
      </div>
    </div>
  );
}

function NotificationSwitchRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-[#f0e4e4] py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fde6e6] text-accent-red">
        <Icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-charcoal">{title}</p>
        <p className="mt-1 text-sm text-muted-warm">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-red/15",
          checked ? "bg-accent-red" : "bg-[#d8cdcd]",
        )}
      >
        <span
          className={cn(
            "size-6 rounded-full bg-white shadow-[0_6px_14px_rgba(31,29,29,0.14)] transition-transform",
            checked ? "translate-x-6" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

function SmallOutlineButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className="h-10 rounded-xl border-[#eadede] bg-white px-4 text-sm font-semibold text-charcoal hover:bg-[#fff7f7]"
    >
      {children}
    </Button>
  );
}

function IntegrationStatus({
  connected,
}: {
  connected: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
        connected ? "bg-[#eaf7ee] text-[#15803d]" : "bg-[#fde6e6] text-accent-red",
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          connected ? "bg-[#16a34a]" : "bg-accent-red",
        )}
      />
      {connected ? "Verbunden" : "Nicht verbunden"}
    </span>
  );
}

function ProfileCard({ onProfileImageChange }: { onProfileImageChange: () => void }) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <CardTitle title="Konto & Profil" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[140px_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-start gap-4">
          <div className="flex size-[110px] items-center justify-center rounded-full bg-accent-red text-3xl font-semibold text-white shadow-[0_18px_34px_rgba(223,38,52,0.2)]">
            SL
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onProfileImageChange}
            className="h-11 rounded-xl border-accent-red/20 bg-[#fff7f7] px-4 text-sm font-semibold text-accent-red hover:bg-[#fdeeee]"
          >
            <Camera className="size-4" />
            Profilbild ändern
          </Button>
        </div>

        <div className="rounded-[24px] border border-[#f0e4e4] bg-[#fffdfd] px-5">
          <ProfileInfoRow label="Name" value="SuperLottomatch Admin" />
          <div className="h-px bg-[#f0e4e4]" />
          <ProfileInfoRow label="E-Mail" value="admin@superlottomatch.ch" />
          <div className="h-px bg-[#f0e4e4]" />
          <ProfileInfoRow label="Rolle" value="Administrator" />
          <div className="h-px bg-[#f0e4e4]" />
          <ProfileInfoRow label="Telefon" value="+41 41 000 00 00" />
        </div>
      </div>
    </SurfaceCard>
  );
}

function QuickStatusCard() {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <CardTitle title="Schnellstatus" />

      <div className="mt-6 space-y-3">
        {QUICK_STATUSES.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-[20px] border border-[#f0e4e4] bg-[#fffdfd] px-4 py-4"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fde6e6] text-accent-red">
                <Icon className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-charcoal">{item.label}</p>
              </div>

              <StatusBadge tone="green" label={item.status} />
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

function GeneralSettingsCard({
  settings,
  onChange,
}: {
  settings: GeneralSettingsState;
  onChange: <K extends keyof GeneralSettingsState>(
    key: K,
    value: GeneralSettingsState[K],
  ) => void;
}) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <CardTitle title="Allgemeine Einstellungen" />

      <div className="mt-6">
        <SettingsSelectRow
          id="language"
          label="Standardsprache"
          value={settings.language}
          options={["Deutsch", "English", "Français"]}
          onChange={(value) => onChange("language", value)}
        />
        <SettingsSelectRow
          id="timezone"
          label="Zeitzone"
          value={settings.timezone}
          options={["Europe/Zurich", "Europe/Berlin", "UTC"]}
          onChange={(value) => onChange("timezone", value)}
        />
        <SettingsSelectRow
          id="currency"
          label="Währung"
          value={settings.currency}
          options={["CHF", "EUR", "USD"]}
          onChange={(value) => onChange("currency", value)}
        />
        <SettingsSelectRow
          id="event-type"
          label="Standard-Eventtyp"
          value={settings.eventType}
          options={["Lottomatch", "Verlosung", "Check-in Event"]}
          onChange={(value) => onChange("eventType", value)}
        />
      </div>
    </SurfaceCard>
  );
}

function NotificationsCard({
  settings,
  onChange,
}: {
  settings: NotificationSettingsState;
  onChange: <K extends keyof NotificationSettingsState>(
    key: K,
    value: NotificationSettingsState[K],
  ) => void;
}) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <CardTitle title="Benachrichtigungen" />

      <div className="mt-6">
        <NotificationSwitchRow
          icon={Mail}
          title="E-Mail Updates"
          description="Erhalten Sie wichtige Updates per E-Mail."
          checked={settings.emailUpdates}
          onCheckedChange={(value) => onChange("emailUpdates", value)}
        />
        <NotificationSwitchRow
          icon={Radio}
          title="Live Check-in Hinweise"
          description="Hinweise zu Live Check-ins und Aktivität."
          checked={settings.liveCheckin}
          onCheckedChange={(value) => onChange("liveCheckin", value)}
        />
        <NotificationSwitchRow
          icon={UserPlus}
          title="Neue Gästeimporte"
          description="Benachrichtigung bei erfolgreichen Importen."
          checked={settings.newImports}
          onCheckedChange={(value) => onChange("newImports", value)}
        />
        <NotificationSwitchRow
          icon={ClipboardList}
          title="Report-Zusammenfassungen"
          description="Regelmässige Zusammenfassungen und Reports."
          checked={settings.reportSummary}
          onCheckedChange={(value) => onChange("reportSummary", value)}
        />
      </div>
    </SurfaceCard>
  );
}

function SecurityCard({
  onPasswordChange,
  onManageDevices,
}: {
  onPasswordChange: () => void;
  onManageDevices: () => void;
}) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <CardTitle title="Sicherheit" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[170px_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] bg-[#fdeaea] p-6 text-accent-red">
          <div className="flex size-16 items-center justify-center rounded-full bg-white shadow-[0_14px_28px_rgba(223,38,52,0.12)]">
            <ShieldCheck className="size-8" />
          </div>
          <div className="flex items-center gap-3">
            <Lock className="size-5" />
            <MonitorSmartphone className="size-5" />
          </div>
        </div>

        <div className="divide-y divide-[#f0e4e4] rounded-[24px] border border-[#f0e4e4] bg-[#fffdfd]">
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-warm">Passwort</p>
              <p className="mt-1 text-sm font-semibold text-charcoal">
                ••••••••••
              </p>
            </div>
            <SmallOutlineButton onClick={onPasswordChange}>
              Passwort ändern
            </SmallOutlineButton>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-warm">Zwei-Faktor-Authentifizierung</p>
            </div>
            <StatusBadge tone="green" label="Aktiv" />
          </div>

          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-warm">Letzter Login</p>
              <p className="mt-1 text-sm font-semibold text-charcoal">
                Heute, 08:42
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-warm">Sitzungen verwalten</p>
            </div>
            <SmallOutlineButton onClick={onManageDevices}>
              Alle Geräte anzeigen
            </SmallOutlineButton>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function BrandingStandardsCard({
  onEditBranding,
}: {
  onEditBranding: () => void;
}) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <CardTitle title="Branding & Event-Standards" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-[24px] border border-[#f0e4e4] bg-[#fffdfd] p-5">
          <div className="flex size-20 items-center justify-center rounded-[20px] bg-[#fde6e6]">
            <Image
              src="/logo.png"
              alt="STV Events Logo"
              width={64}
              height={64}
              className="h-14 w-14 object-contain"
            />
          </div>

          <div className="mt-4">
            <p className="text-base font-semibold text-charcoal">STV Events</p>
            <p className="mt-1 text-sm text-muted-warm">
              by SuperLottomatch
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-[24px] border border-[#f0e4e4] bg-[#fffdfd] p-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-warm">Primärfarbe</span>
            <div className="flex items-center gap-3">
              <span className="size-5 rounded-full bg-accent-red" />
              <span className="text-sm font-semibold text-charcoal">#DF2634</span>
            </div>
          </div>

          <div className="h-px bg-[#f0e4e4]" />

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-warm">Check-in Standard</span>
            <span className="text-sm font-semibold text-charcoal">
              QR-Code aktiviert
            </span>
          </div>

          <div className="h-px bg-[#f0e4e4]" />

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-warm">Gäste-Code Präfix</span>
            <span className="text-sm font-semibold text-charcoal">SL-</span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onEditBranding}
        className="mt-6 h-11 rounded-xl border-[#eadede] bg-white px-4 text-sm font-semibold text-charcoal hover:bg-[#fff7f7]"
      >
        <Pencil className="size-4 text-accent-red" />
        Branding bearbeiten
      </Button>
    </SurfaceCard>
  );
}

function HelpCenterCard({ onSupport }: { onSupport: () => void }) {
  return (
    <section className="rounded-[28px] border border-[#f0d7d8] bg-[#fdeaea] p-5 shadow-[0_18px_42px_rgba(116,82,82,0.08)] sm:p-6">
      <CardTitle
        title="Hilfe-Center"
        action={
          <div className="flex size-10 items-center justify-center rounded-full border border-accent-red/20 text-accent-red">
            <Info className="size-4" />
          </div>
        }
      />

      <p className="mt-5 text-sm leading-7 text-muted-warm">
        Benötigen Sie Hilfe bei den Einstellungen? Unser Team unterstützt Sie gerne.
      </p>

      <button
        type="button"
        onClick={onSupport}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-red transition hover:text-accent-red-dark"
      >
        Support kontaktieren
        <ArrowRight className="size-4" />
      </button>
    </section>
  );
}

function IntegrationsCard() {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <CardTitle title="Integrationen" />

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon;

          return (
            <div
              key={integration.key}
              className="rounded-[22px] border border-[#f0e4e4] bg-[#fffdfd] p-4 shadow-[0_10px_24px_rgba(31,29,29,0.04)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full",
                    integration.connected
                      ? "bg-[#eaf7ee] text-[#16a34a]"
                      : "bg-[#fde6e6] text-accent-red",
                  )}
                >
                  {integration.connected ? (
                    <Icon className="size-5" />
                  ) : (
                    <CloudOff className="size-5" />
                  )}
                </div>
                <IntegrationStatus connected={integration.connected} />
              </div>

              <div className="mt-4">
                <p className="text-base font-semibold text-charcoal">
                  {integration.title}
                </p>
                <p className="mt-2 text-sm text-muted-warm">
                  {integration.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

export default function DesktopSettingsPage() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettingsState>({
    ...DEFAULT_GENERAL_SETTINGS,
  });
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettingsState>({ ...DEFAULT_NOTIFICATION_SETTINGS });

  const handleGeneralSettingChange = <K extends keyof GeneralSettingsState>(
    key: K,
    value: GeneralSettingsState[K],
  ) => {
    setGeneralSettings((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  };

  const handleNotificationChange = <
    K extends keyof NotificationSettingsState,
  >(
    key: K,
    value: NotificationSettingsState[K],
  ) => {
    setNotificationSettings((currentState) => ({
      ...currentState,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setGeneralSettings({ ...DEFAULT_GENERAL_SETTINGS });
    setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS });
    console.info("Einstellungen wurden auf Standardwerte zurückgesetzt.");
  };

  const handleSave = () => {
    console.info("Einstellungen gespeichert", {
      generalSettings,
      notificationSettings,
    });
  };

  const handlePlaceholderAction = (label: string) => {
    console.info(`${label} ist noch nicht verbunden.`);
  };

  return (
    <div className="min-h-screen w-full bg-page-dashboard">
      <div className="w-full px-6 py-8 md:px-8 xl:px-10 xl:py-10">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <PageReveal delay={0} variant="up" className="max-w-4xl">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                Einstellungen
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-warm sm:text-lg">
                Verwalten Sie Konto, Benachrichtigungen, Sicherheit und Event-Standards.
              </p>
            </div>
          </PageReveal>

          <PageReveal delay={120} variant="right" className="xl:shrink-0">
            <div className="flex flex-col gap-3 sm:flex-row">
              <HeaderButton
                icon={RotateCcw}
                variant="secondary"
                onClick={handleReset}
              >
                Zurücksetzen
              </HeaderButton>
              <HeaderButton icon={Check} variant="primary" onClick={handleSave}>
                Änderungen speichern
              </HeaderButton>
            </div>
          </PageReveal>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <PageReveal delay={220} variant="left" className="h-full w-full">
            <ProfileCard
              onProfileImageChange={() =>
                handlePlaceholderAction("Profilbild ändern")
              }
            />
          </PageReveal>
          <PageReveal delay={300} variant="right" className="h-full w-full">
            <QuickStatusCard />
          </PageReveal>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <PageReveal delay={380} variant="left" className="h-full w-full">
            <GeneralSettingsCard
              settings={generalSettings}
              onChange={handleGeneralSettingChange}
            />
          </PageReveal>
          <PageReveal delay={460} variant="right" className="h-full w-full">
            <NotificationsCard
              settings={notificationSettings}
              onChange={handleNotificationChange}
            />
          </PageReveal>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(300px,0.9fr)]">
          <PageReveal delay={540} variant="up" className="h-full w-full">
            <SecurityCard
              onPasswordChange={() =>
                handlePlaceholderAction("Passwort ändern")
              }
              onManageDevices={() =>
                handlePlaceholderAction("Alle Geräte anzeigen")
              }
            />
          </PageReveal>
          <PageReveal delay={620} variant="up" className="h-full w-full">
            <BrandingStandardsCard
              onEditBranding={() =>
                handlePlaceholderAction("Branding bearbeiten")
              }
            />
          </PageReveal>
          <PageReveal delay={700} variant="up" className="h-full w-full">
            <HelpCenterCard
              onSupport={() => handlePlaceholderAction("Support kontaktieren")}
            />
          </PageReveal>
        </div>

        <div className="mt-6">
          <PageReveal delay={780} variant="up">
            <IntegrationsCard />
          </PageReveal>
        </div>
      </div>
    </div>
  );
}
