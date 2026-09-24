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

// ─── Custom Precision Telemetry Tooltip ───────────────────────────────────────

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
    <div className="rounded-lg border border-carbon-700 bg-carbon-900/95 backdrop-blur-md px-3.5 py-2.5 shadow-2xl font-mono text-xs">
      <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-bold">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-black text-white tabular-nums">
          {val.toLocaleString("id-ID")}
        </span>
        <span className="text-volt-400 font-extrabold text-xs uppercase">
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─── Custom Active & Peak Dots ────────────────────────────────────────────────

function CustomActiveDot({ cx = 0, cy = 0 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill="#ccff00" opacity={0.25} />
      <circle cx={cx} cy={cy} r={4.5} fill="#ccff00" stroke="#090a0e" strokeWidth={2} />
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
        {/* Athletic Grid */}
        <CartesianGrid
          strokeDasharray="2 3"
          stroke="#1c202a"
          vertical={false}
        />

        {/* Axes */}
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={{ stroke: "#1c202a" }}
          dy={8}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
          width={48}
        />

        {/* Average line */}
        <ReferenceLine
          y={avg}
          stroke="#2c3342"
          strokeDasharray="4 4"
          label={{
            value: `AVG: ${avg}${unit}`,
            fill: "#64748b",
            fontSize: 10,
            fontFamily: "monospace",
            position: "insideTopRight",
          }}
        />

        {/* Tooltip */}
        <Tooltip
          content={<CustomTooltip unit={unit} />}
          cursor={{ stroke: "#2c3342", strokeWidth: 1, strokeDasharray: "3 3" }}
        />

        {/* Data line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#ccff00"
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
                fill={isPeak ? "#f59e0b" : "#ccff00"}
                stroke="#090a0e"
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

