"use client";

import { memo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Dot,
} from "recharts";
import type { ChartPoint } from "@/app/progress/page";

// ─── Apple Health Style Tooltip ──────────────────────────────────────────────

interface TooltipPayloadItem {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  unit: string;
}

function CustomTooltip({ active, payload, label, unit }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;

  return (
    <div className="rounded-xl border border-ios-border bg-ios-card/95 backdrop-blur-xl px-3.5 py-2.5 shadow-2xl">
      <p className="text-ios-muted text-[11px] mb-1 font-medium">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-white tabular-nums">
          {val.toLocaleString("id-ID")}
        </span>
        <span className="text-ios-blue font-semibold text-xs">
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─── Active Dot ──────────────────────────────────────────────────────────────

function CustomActiveDot({ cx = 0, cy = 0 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#0a84ff" opacity={0.25} />
      <circle cx={cx} cy={cy} r={4.5} fill="#0a84ff" stroke="#000000" strokeWidth={2} />
    </g>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProgressChartProps {
  data: ChartPoint[];
  unit: string;
  metric: string;
}

const ProgressChart = memo(function ProgressChart({ data, unit }: ProgressChartProps) {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 12, right: 12, bottom: 4, left: -16 }}
      >
        {/* Subtle Horizontal Grid */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#2c2c2e"
          vertical={false}
        />

        {/* Axes */}
        <XAxis
          dataKey="date"
          tick={{ fill: "#8e8e93", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#2c2c2e" }}
          dy={8}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#8e8e93", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
          width={48}
        />

        {/* Average reference line */}
        <ReferenceLine
          y={avg}
          stroke="#38383a"
          strokeDasharray="4 4"
          label={{
            value: `Rata-rata: ${avg} ${unit}`,
            fill: "#8e8e93",
            fontSize: 11,
            position: "insideTopRight",
          }}
        />

        {/* Tooltip */}
        <Tooltip
          content={<CustomTooltip unit={unit} />}
          cursor={{ stroke: "#38383a", strokeWidth: 1, strokeDasharray: "3 3" }}
        />

        {/* Clean iOS Blue Data Line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#0a84ff"
          strokeWidth={2.5}
          dot={(props) => {
            const { cx, cy, index, payload } = props;
            const isPeak = payload.value === maxVal;
            const isLast = index === data.length - 1;

            return (
              <Dot
                key={`dot-${index}`}
                cx={cx}
                cy={cy}
                r={isPeak ? 5 : isLast ? 4 : 3}
                fill={isPeak ? "#ff9f0a" : "#0a84ff"}
                stroke="#000000"
                strokeWidth={isPeak || isLast ? 2 : 1}
              />
            );
          }}
          activeDot={(props: any) => (
            <CustomActiveDot cx={props.cx} cy={props.cy} />
          )}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

export default ProgressChart;
