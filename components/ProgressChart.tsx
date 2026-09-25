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

// ─── Custom tooltip ───────────────────────────────────────────────────────────

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
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 shadow-xl text-xs font-medium">
      <p className="text-zinc-500 text-[11px] mb-0.5">{label}</p>
      <p className="text-zinc-100 font-bold">
        {payload[0].value}
        <span className="text-emerald-400 ml-1 font-semibold">{unit}</span>
      </p>
    </div>
  );
}

// ─── Custom active dot ────────────────────────────────────────────────────────

function CustomActiveDot({ cx = 0, cy = 0 }: { cx?: number; cy?: number }) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill="#10b981"
      stroke="#09090b"
      strokeWidth={2}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProgressChartProps {
  data: ChartPoint[];
  unit: string;
  metric: string;
}

const ProgressChart = memo(function ProgressChart({ data, unit }: ProgressChartProps) {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
      >
        {/* Grid */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#27272a"
          vertical={false}
        />

        {/* Axes */}
        <XAxis
          dataKey="date"
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          dy={6}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}${unit}`}
          width={48}
        />

        {/* Average reference line */}
        <ReferenceLine
          y={avg}
          stroke="#3f3f46"
          strokeDasharray="4 3"
          label={{
            value: `avg ${avg}${unit}`,
            fill: "#a1a1aa",
            fontSize: 10,
            position: "insideTopRight",
          }}
        />

        {/* Tooltip */}
        <Tooltip
          content={<CustomTooltip unit={unit} />}
          cursor={{ stroke: "#3f3f46", strokeWidth: 1 }}
        />

        {/* Data line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={(props) => {
            const { cx, cy, index } = props;
            const isLast = index === data.length - 1;
            return (
              <Dot
                key={`dot-${index}`}
                cx={cx}
                cy={cy}
                r={isLast ? 4.5 : 3}
                fill={isLast ? "#34d399" : "#10b981"}
                stroke={isLast ? "#09090b" : "#10b981"}
                strokeWidth={isLast ? 2 : 0}
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

