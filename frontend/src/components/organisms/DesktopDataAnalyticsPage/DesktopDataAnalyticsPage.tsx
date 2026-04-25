"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Monitor,
  Plus,
  QrCode,
  Share2,
  Trophy,
  Users,
} from "lucide-react";

import ProgressBar from "@/components/atoms/ProgressBar";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import PageReveal from "@/components/atoms/PageReveal";
import {
  analyticsPeriods,
  analyticsSummary,
  checkinsByDay,
  deviceDistribution,
  liveOverview,
  marketingConsent,
  participantTrend,
  reportActions,
  topEvents,
} from "@/lib/data-analytics-mock";
import { cn } from "@/lib/utils";

const swissNumberFormatter = new Intl.NumberFormat("de-CH");
const swissDecimalFormatter = new Intl.NumberFormat("de-CH", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const deviceColors = {
  desktop: "#df2634",
  mobile: "#f3a8b0",
  tablet: "#d9cfcf",
} as const;

const consentColors = {
  granted: "#df2634",
  pending: "#f6cbd1",
  rejected: "#d7d2d2",
} as const;

const lineChartConfig = {
  participants: {
    label: "Teilnehmer",
    color: "#df2634",
  },
} satisfies ChartConfig;

const deviceChartConfig = {
  desktop: { label: "Desktop", color: deviceColors.desktop },
  mobile: { label: "Mobile", color: deviceColors.mobile },
  tablet: { label: "Tablet", color: deviceColors.tablet },
} satisfies ChartConfig;

const checkinsChartConfig = {
  value: { label: "Check-ins", color: "#df2634" },
} satisfies ChartConfig;

const consentChartConfig = {
  granted: { label: "Eingewilligt", color: consentColors.granted },
} satisfies ChartConfig;

const liveOverviewIcons: Record<
  (typeof liveOverview)[number]["key"],
  LucideIcon
> = {
  visitors: Users,
  devices: Monitor,
  scans: QrCode,
};

const quickActionIcons: Record<
  (typeof reportActions)[number]["key"],
  LucideIcon
> = {
  csv: Download,
  pdf: FileText,
  share: Share2,
};

function formatSwissNumber(value: number) {
  return swissNumberFormatter.format(value);
}

function formatSwissDecimal(value: number) {
  return swissDecimalFormatter.format(value);
}

interface AnalyticsCardProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

function AnalyticsCard({
  title,
  action,
  className,
  children,
}: AnalyticsCardProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_18px_45px_rgba(116,82,82,0.08)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-charcoal">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

interface AnalyticsSelectProps {
  ariaLabel: string;
  options: readonly {
    label: string;
    value: string;
  }[];
  icon?: LucideIcon;
  className?: string;
}

function AnalyticsSelect({
  ariaLabel,
  options,
  icon: Icon,
  className,
}: AnalyticsSelectProps) {
  return (
    <label
      className={cn(
        "flex min-w-[11rem] items-center gap-3 rounded-2xl border border-black/5 bg-[#fff7f7] px-4 py-3 text-sm shadow-[0_10px_25px_rgba(31,29,29,0.04)]",
        className
      )}
    >
      {Icon ? <Icon className="size-4 text-muted-warm" /> : null}
      <select
        aria-label={ariaLabel}
        defaultValue={options[0]?.value}
        className="min-w-0 flex-1 appearance-none bg-transparent font-medium text-charcoal outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="size-4 text-muted-warm" />
    </label>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: string;
  subtitle?: string;
  progress?: number;
}

function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  subtitle,
  progress,
}: KpiCardProps) {
  return (
    <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_18px_40px_rgba(116,82,82,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted-warm uppercase">
            {label}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="text-[2.35rem] font-semibold leading-none tracking-tight text-charcoal sm:text-[2.8rem]">
              {value}
            </p>
            {delta ? (
              <span className="pb-1 text-sm font-semibold text-accent-red">
                {delta}
              </span>
            ) : null}
          </div>
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-warm">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-red-soft text-accent-red">
          <Icon className="size-5" />
        </div>
      </div>

      {typeof progress === "number" ? (
        <div className="mt-5">
          <ProgressBar value={progress} />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-warm">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ParticipantsChart({ className }: { className?: string }) {
  return (
    <AnalyticsCard
      title="Teilnehmerentwicklung"
      action={
        <AnalyticsSelect
          ariaLabel="Teilnehmerentwicklung Zeitraum"
          options={[{ label: "Monatlich", value: "monthly" }]}
          className="min-w-[9.5rem]"
        />
      }
      className={className}
    >
      <ChartContainer config={lineChartConfig} className="h-[290px]">
        <AreaChart
          data={participantTrend}
          margin={{ top: 12, right: 12, bottom: 0, left: -18 }}
        >
          <defs>
            <linearGradient id="participants-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#df2634" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#df2634" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#ecdede"
            strokeDasharray="4 7"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6f6262", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6f6262", fontSize: 12 }}
            ticks={[0, 500, 1000, 1500]}
            domain={[0, 1500]}
            tickFormatter={(value: number) => formatSwissNumber(value)}
          />
          <ChartTooltip
            cursor={{
              stroke: "#df2634",
              strokeDasharray: "4 4",
              strokeOpacity: 0.35,
            }}
            content={
              <ChartTooltipContent
                indicator="line"
                valueFormatter={(value) =>
                  formatSwissNumber(Number(value ?? 0))
                }
              />
            }
          />
          <Area
            type="monotone"
            dataKey="participants"
            stroke="var(--color-participants)"
            fill="url(#participants-fill)"
            strokeWidth={3}
            dot={{
              fill: "#df2634",
              stroke: "#ffffff",
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: "#df2634",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ChartContainer>

      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-warm">
        <span className="size-2.5 rounded-full bg-accent-red" />
        Teilnehmer
      </div>
    </AnalyticsCard>
  );
}

function DeviceDistributionChart({ className }: { className?: string }) {
  return (
    <AnalyticsCard title="Geräteverteilung" className={className}>
      <div className="relative">
        <ChartContainer
          config={deviceChartConfig}
          className="mx-auto h-[250px] max-w-[280px]"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  valueFormatter={(value) => `${value}%`}
                />
              }
            />
            <Pie
              data={deviceDistribution}
              dataKey="value"
              nameKey="label"
              innerRadius={68}
              outerRadius={94}
              paddingAngle={4}
              stroke="none"
            >
              {deviceDistribution.map((item) => (
                <Cell key={item.key} fill={deviceColors[item.key]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-semibold tracking-tight text-charcoal">
            {formatSwissNumber(analyticsSummary.totalGuests)}
          </p>
          <p className="mt-1 text-sm text-muted-warm">Gesamt</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {deviceDistribution.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2 text-muted-warm">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: deviceColors[item.key] }}
              />
              <span>{item.label}</span>
            </div>
            <span className="font-semibold text-charcoal">{item.value}%</span>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}

function CheckinsBarChart({ className }: { className?: string }) {
  return (
    <AnalyticsCard title="Check-ins pro Event-Tag" className={className}>
      <ChartContainer config={checkinsChartConfig} className="h-[300px]">
        <BarChart
          data={checkinsByDay}
          margin={{ top: 18, right: 10, bottom: 0, left: -18 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="#ecdede"
            strokeDasharray="4 7"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6f6262", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6f6262", fontSize: 12 }}
            tickFormatter={(value: number) => formatSwissNumber(value)}
          />
          <ChartTooltip
            cursor={{ fill: "#fdf1f1" }}
            content={
              <ChartTooltipContent
                valueFormatter={(value) =>
                  formatSwissNumber(Number(value ?? 0))
                }
              />
            }
          />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={[18, 18, 6, 6]}
            maxBarSize={48}
          >
            <LabelList
              dataKey="value"
              position="top"
              fill="#1f1d1d"
              fontSize={12}
              formatter={(value) => formatSwissNumber(Number(value ?? 0))}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </AnalyticsCard>
  );
}

function TopEventsTable({ className }: { className?: string }) {
  return (
    <AnalyticsCard title="Top Events" className={className}>
      <div className="-mx-2 overflow-x-auto px-2">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-[0.72rem] font-semibold tracking-[0.18em] text-muted-warm uppercase">
              <th className="px-4 py-2">Event</th>
              <th className="px-4 py-2">Gäste</th>
              <th className="px-4 py-2">Check-ins</th>
              <th className="px-4 py-2">Conversion</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {topEvents.map((event) => {
              const checkInRate = Math.round(
                (event.checkIns / event.guests) * 100
              );

              return (
                <tr key={event.name} className="rounded-2xl bg-[#fff9f9]">
                  <td className="rounded-l-2xl px-4 py-4 align-middle">
                    <div>
                      <p className="font-semibold text-charcoal">{event.name}</p>
                      <p className="mt-1 text-sm text-muted-warm">
                        {event.date}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-charcoal">
                    {formatSwissNumber(event.guests)}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-charcoal">
                    {formatSwissNumber(event.checkIns)} ({checkInRate}%)
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-charcoal">
                    {formatSwissDecimal(event.conversion)}%
                  </td>
                  <td className="rounded-r-2xl px-4 py-4">
                    <span className="inline-flex rounded-full bg-[#eaf7ee] px-3 py-1 text-xs font-semibold text-[#1e8b53]">
                      {event.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent-red transition-colors hover:text-accent-red-dark"
        >
          Alle Events anzeigen
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </AnalyticsCard>
  );
}

function LiveOverviewCard() {
  return (
    <AnalyticsCard
      title="Live Übersicht"
      action={
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-red-soft px-3 py-1 text-xs font-semibold text-accent-red">
          <span className="size-2 rounded-full bg-accent-red" />
          Live
        </span>
      }
    >
      <div className="space-y-3">
        {liveOverview.map((item) => {
          const Icon = liveOverviewIcons[item.key];

          return (
            <div
              key={item.key}
              className="flex items-center gap-4 rounded-3xl border border-black/5 bg-[#fff9f9] px-4 py-4"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-red-soft text-accent-red">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-warm">{item.label}</p>
              </div>
              <p className="text-2xl font-semibold tracking-tight text-charcoal">
                {formatSwissNumber(item.value)}
              </p>
            </div>
          );
        })}
      </div>
    </AnalyticsCard>
  );
}

function MarketingConsentCard() {
  const radialData = [
    {
      key: "granted",
      label: "Eingewilligt",
      value: marketingConsent.grantedPercentage,
      fill: consentColors.granted,
    },
  ];

  return (
    <AnalyticsCard title="Marketing-Einwilligung">
      <div className="relative">
        <ChartContainer
          config={consentChartConfig}
          className="mx-auto h-[200px] max-w-[220px]"
        >
          <RadialBarChart
            data={radialData}
            startAngle={90}
            endAngle={-270}
            innerRadius={68}
            outerRadius={102}
            barSize={14}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  valueFormatter={(value) => `${value}%`}
                />
              }
            />
            <RadialBar
              dataKey="value"
              cornerRadius={999}
              background={{ fill: "#f2e6e6" }}
            />
          </RadialBarChart>
        </ChartContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-semibold tracking-tight text-charcoal">
            {marketingConsent.grantedPercentage}%
          </p>
          <p className="mt-1 text-sm text-muted-warm">Einwilligung erteilt</p>
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-muted-warm">
        {formatSwissNumber(marketingConsent.grantedCount)} von{" "}
        {formatSwissNumber(marketingConsent.totalGuests)} Gästen
      </p>

      <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-[#f4ebeb]">
        {marketingConsent.breakdown.map((item) => (
          <div
            key={item.key}
            className="h-full"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: consentColors[item.key],
            }}
          />
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {marketingConsent.breakdown.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2 text-muted-warm">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: consentColors[item.key] }}
              />
              <span>{item.label}</span>
            </div>
            <span className="font-semibold text-charcoal">
              {item.percentage}% ({formatSwissNumber(item.count)})
            </span>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}

function QuickActionsCard({
  onAction,
}: {
  onAction: (actionLabel: string) => void;
}) {
  return (
    <AnalyticsCard title="Schnellaktionen">
      <div className="space-y-3">
        {reportActions.map((action) => {
          const Icon = quickActionIcons[action.key];

          return (
            <button
              key={action.key}
              type="button"
              onClick={() => onAction(action.label)}
              className="flex w-full items-center gap-3 rounded-2xl border border-black/5 bg-[#fff9f9] px-4 py-4 text-left text-sm font-semibold text-charcoal shadow-[0_12px_24px_rgba(31,29,29,0.04)] transition-all hover:-translate-y-0.5 hover:bg-accent-red-soft/35"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-accent-red shadow-[0_8px_18px_rgba(31,29,29,0.05)]">
                <Icon className="size-4" />
              </span>
              {action.label}
            </button>
          );
        })}
      </div>
    </AnalyticsCard>
  );
}

function RightAnalyticsSidebar({
  onAction,
}: {
  onAction: (actionLabel: string) => void;
}) {
  return (
    <aside className="flex flex-col gap-6 xl:sticky xl:top-8 xl:self-start">
      <AnalyticsCard
        title="Zeitraum"
        action={<CalendarDays className="size-4 text-muted-warm" />}
      >
        <AnalyticsSelect
          ariaLabel="Analytics Zeitraum"
          options={analyticsPeriods}
          icon={CalendarDays}
          className="w-full"
        />
      </AnalyticsCard>

      <LiveOverviewCard />
      <MarketingConsentCard />
      <QuickActionsCard onAction={onAction} />
    </aside>
  );
}

export default function DesktopDataAnalyticsPage() {
  const handlePlaceholderAction = (actionLabel: string) => {
    console.info(`${actionLabel} ist noch nicht verbunden.`);
  };

  return (
    <div className="min-h-full bg-page-dashboard">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 xl:py-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <PageReveal delay={0} variant="up" className="max-w-3xl">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                Daten &amp; Auswertungen
              </h1>
              <p className="mt-3 text-base leading-7 text-muted-warm sm:text-lg">
                Behalten Sie Kennzahlen, Teilnehmeraktivität und
                Event-Performance im Blick.
              </p>
            </div>
          </PageReveal>

          <PageReveal delay={120} variant="right">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePlaceholderAction("Bericht exportieren")}
                className="h-12 rounded-xl border-black/5 bg-white px-4 text-charcoal shadow-[0_14px_30px_rgba(31,29,29,0.05)] hover:bg-[#fff7f7]"
              >
                <Download className="size-4" />
                Bericht exportieren
              </Button>
              <Button
                type="button"
                onClick={() => handlePlaceholderAction("Neuer Report")}
                className="h-12 rounded-xl border-transparent bg-[linear-gradient(135deg,#df2634_0%,#b80012_100%)] px-4 text-white shadow-[0_18px_35px_rgba(223,38,52,0.24)] hover:opacity-95"
              >
                <Plus className="size-4" />
                Neuer Report
              </Button>
            </div>
          </PageReveal>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
          <PageReveal delay={200} variant="up" className="h-full w-full">
            <KpiCard
              label="Gesamt Gäste"
              value={formatSwissNumber(analyticsSummary.totalGuests)}
              delta="+8.2%"
              subtitle="vs. letzte 30 Tage"
              icon={Users}
            />
          </PageReveal>
          <PageReveal delay={280} variant="up" className="h-full w-full">
            <KpiCard
              label="Check-in Rate"
              value={`${analyticsSummary.checkInRate}%`}
              progress={analyticsSummary.checkInRate}
              icon={CheckCircle2}
            />
          </PageReveal>
          <PageReveal delay={360} variant="up" className="h-full w-full">
            <KpiCard
              label="Aktive Events"
              value={String(analyticsSummary.activeEvents)}
              icon={CalendarDays}
            />
          </PageReveal>
          <PageReveal delay={440} variant="up" className="h-full w-full">
            <KpiCard
              label="Verlosungen Abgeschlossen"
              value={String(analyticsSummary.completedDrawings)}
              icon={Trophy}
            />
          </PageReveal>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_340px]">
          <div className="grid gap-6 xl:grid-cols-3">
            <PageReveal delay={520} variant="left" className="h-full w-full xl:col-span-2">
              <ParticipantsChart className="xl:col-span-2" />
            </PageReveal>
            <PageReveal delay={600} variant="up" className="h-full w-full">
              <DeviceDistributionChart />
            </PageReveal>
            <PageReveal delay={680} variant="left" className="h-full w-full xl:col-span-2">
              <CheckinsBarChart className="xl:col-span-2" />
            </PageReveal>
            <PageReveal delay={760} variant="up" className="h-full w-full xl:col-span-3">
              <TopEventsTable className="xl:col-span-3" />
            </PageReveal>
          </div>

          <PageReveal delay={620} variant="right" className="h-full w-full">
            <RightAnalyticsSidebar onAction={handlePlaceholderAction} />
          </PageReveal>
        </div>
      </div>
    </div>
  );
}
