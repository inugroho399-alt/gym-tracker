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
} from "recharts";
import type { ChartPoint } from "@/app/progress/page";

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
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 shadow-lg text-xs">
      <p className="text-neutral-400 text-[10px]">{label}</p>
      <p className="font-semibold text-white">
        {val.toLocaleString("id-ID")} <span className="text-neutral-400 font-normal">{unit}</span>
      </p>
    </div>
  );
}

interface ProgressChartProps {
  data: ChartPoint[];
  unit: string;
}

const ProgressChart = memo(function ProgressChart({ data, unit }: ProgressChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e1e1e"
          vertical={false}
        />

        <XAxis
          dataKey="date"
          tick={{ fill: "#666666", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#1e1e1e" }}
          dy={6}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#666666", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}`}
          width={40}
        />

        <Tooltip
          content={<CustomTooltip unit={unit} />}
          cursor={{ stroke: "#262626", strokeWidth: 1 }}
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#ffffff"
          strokeWidth={2}
          dot={{ r: 3, fill: "#ffffff", stroke: "#000000", strokeWidth: 1.5 }}
          activeDot={{ r: 5, fill: "#ffffff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

export default ProgressChart;
