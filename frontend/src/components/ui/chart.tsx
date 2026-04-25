"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    color?: string;
  }
>;

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("Chart components must be used within ChartContainer.");
  }

  return context;
}

function ChartStyle({
  id,
  config,
}: {
  id: string;
  config: ChartConfig;
}) {
  const variables = Object.entries(config)
    .filter(([, item]) => Boolean(item.color))
    .map(([key, item]) => `--color-${key}: ${item.color};`)
    .join("");

  if (!variables) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart="${id}"] { ${variables} }`,
      }}
    />
  );
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactNode;
  id?: string;
}

export function ChartContainer({
  id,
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  const uniqueId = React.useId().replace(/:/g, "");
  const chartId = `chart-${id ?? uniqueId}`;
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn("h-[240px] min-h-[240px] w-full min-w-0 text-xs", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {isMounted ? (
          <RechartsPrimitive.ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
          >
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div
            aria-hidden
            className="h-full w-full rounded-[24px] bg-[linear-gradient(180deg,#fff9f9_0%,#fff3f3_100%)]"
          />
        )}
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

interface ChartTooltipItem {
  color?: string;
  dataKey?: string | number;
  name?: string;
  payload?: Record<string, unknown>;
  value?: number | string;
}

interface ChartTooltipContentProps {
  active?: boolean;
  className?: string;
  hideLabel?: boolean;
  indicator?: "dot" | "line";
  label?: React.ReactNode;
  labelFormatter?: (label: React.ReactNode) => React.ReactNode;
  payload?: ChartTooltipItem[];
  valueFormatter?: (
    value: number | string,
    item: ChartTooltipItem
  ) => React.ReactNode;
}

export function ChartTooltipContent({
  active,
  className,
  hideLabel = false,
  indicator = "dot",
  label,
  labelFormatter,
  payload,
  valueFormatter,
}: ChartTooltipContentProps) {
  const { config } = useChart();

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "min-w-[10rem] rounded-2xl border border-black/5 bg-white/95 px-3 py-2 shadow-[0_18px_35px_rgba(31,29,29,0.08)] backdrop-blur",
        className
      )}
    >
      {!hideLabel && label ? (
        <p className="mb-2 text-xs font-semibold text-charcoal">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      ) : null}

      <div className="space-y-2">
        {payload.map((item, index) => {
          const configKey = String(
            item.payload?.key ?? item.dataKey ?? item.name ?? index
          );
          const configItem =
            config[configKey] ?? config[String(item.name ?? configKey)];
          const displayLabel = configItem?.label ?? item.name ?? configKey;
          const displayValue =
            item.value == null
              ? ""
              : valueFormatter
                ? valueFormatter(item.value, item)
                : item.value;

          return (
            <div
              key={`${configKey}-${index}`}
              className="flex items-center justify-between gap-6 text-xs"
            >
              <div className="flex items-center gap-2 text-muted-warm">
                <span
                  aria-hidden
                  className={cn(
                    "shrink-0 rounded-full",
                    indicator === "line" ? "h-0.5 w-4" : "size-2.5"
                  )}
                  style={{
                    backgroundColor:
                      item.color ?? String(item.payload?.fill ?? "#df2634"),
                  }}
                />
                <span>{displayLabel}</span>
              </div>
              <span className="font-semibold text-charcoal">
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
