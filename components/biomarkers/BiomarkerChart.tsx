"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  unit: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function BiomarkerChart({ data, unit }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-gray-800 rounded-lg">
        <p className="text-gray-500 text-sm">No data for this type yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#374151" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          unit={` ${unit}`}
          width={70}
        />
        <Tooltip
          contentStyle={{
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: "6px",
            fontSize: "12px",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(label: any) => formatDate(String(label))}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(val: any) => [`${val} ${unit}`, ""]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#ffffff"
          strokeWidth={1.5}
          dot={{ fill: "#ffffff", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
