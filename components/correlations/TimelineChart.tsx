"use client";

import {
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  value?: number;
}

interface LogMarker {
  date: string; // YYYY-MM-DD
  entries: { compound: string; amount: number; unit: string }[];
}

interface Props {
  data: DataPoint[];
  logMarkers: LogMarker[];
  unit: string;
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface TooltipInnerProps {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
  logMarkerMap: Map<string, LogMarker["entries"]>;
  unit: string;
}

function CustomTooltip({ active, payload, label, logMarkerMap, unit }: TooltipInnerProps) {
  if (!active) return null;
  const dateStr = String(label ?? "");
  const logs = logMarkerMap.get(dateStr);
  const bioValue = payload?.[0]?.value;

  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #374151",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 12,
      }}
    >
      <p style={{ color: "#9ca3af", marginBottom: 4 }}>{formatDate(dateStr)}</p>
      {bioValue != null && (
        <p style={{ color: "#fff", marginBottom: logs ? 6 : 0 }}>
          {bioValue} {unit}
        </p>
      )}
      {logs?.map((e, i) => (
        <p key={i} style={{ color: "#d97706" }}>
          {e.compound} · {e.amount} {e.unit}
        </p>
      ))}
    </div>
  );
}

export default function TimelineChart({ data, logMarkers, unit }: Props) {
  const logMarkerMap = new Map(logMarkers.map((m) => [m.date, m.entries]));
  const markerDates = Array.from(new Set(logMarkers.map((m) => m.date)));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-gray-800 rounded-lg">
        <p className="text-gray-500 text-sm">No data for this marker type</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 border-t border-white" />
          {unit ? `${unit} values` : "Biomarker"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-px h-3 bg-amber-500" />
          Compound logged
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={{ stroke: "#374151" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit={unit ? ` ${unit}` : ""}
            width={72}
          />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip content={(props: any) => <CustomTooltip {...props} logMarkerMap={logMarkerMap} unit={unit} />} />

          {markerDates.map((date) => (
            <ReferenceLine
              key={date}
              x={date}
              stroke="#d97706"
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
          ))}

          <Line
            type="monotone"
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={1.5}
            dot={{ fill: "#ffffff", r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
