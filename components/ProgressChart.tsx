"use client";

/**
 * components/ProgressChart.tsx
 * Pure recharts chart component — always rendered client-side.
 * Imported via dynamic() in progress/page.tsx to skip SSR.
 */

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
    <div className="rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 shadow-xl text-sm">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold">
        {payload[0].value}
        <span className="text-indigo-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}

// ─── Custom active dot ────────────────────────────────────────────────────────

interface CustomDotProps {
  cx?: number;
  cy?: number;
  index?: number;
  dataLength: number;
}

function CustomActiveDot({ cx = 0, cy = 0 }: CustomDotProps) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill="#6366f1"
      stroke="#fff"
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

export default function ProgressChart({ data, unit }: ProgressChartProps) {
  const values = data.map((d) => d.value);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
      >
        {/* Grid */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1f2937"
          vertical={false}
        />

        {/* Axes */}
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          dy={6}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}${unit}`}
          width={52}
        />

        {/* Average reference line */}
        <ReferenceLine
          y={avg}
          stroke="#374151"
          strokeDasharray="4 3"
          label={{
            value: `avg ${avg}${unit}`,
            fill: "#6b7280",
            fontSize: 10,
            position: "insideTopRight",
          }}
        />

        {/* Tooltip */}
        <Tooltip
          content={<CustomTooltip unit={unit} />}
          cursor={{ stroke: "#374151", strokeWidth: 1 }}
        />

        {/* Data line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={(props) => {
            const { cx, cy, index } = props;
            // Highlight the last point (current record)
            const isLast = index === data.length - 1;
            return (
              <Dot
                key={`dot-${index}`}
                cx={cx}
                cy={cy}
                r={isLast ? 5 : 3.5}
                fill={isLast ? "#818cf8" : "#6366f1"}
                stroke={isLast ? "#fff" : "#6366f1"}
                strokeWidth={isLast ? 2 : 0}
              />
            );
          }}
          activeDot={(props: any) => (
            <CustomActiveDot {...props} dataLength={data.length} />
          )}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
