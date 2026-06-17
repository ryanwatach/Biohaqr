"use client";

import type { BiomarkerRange, RangeStatus } from "@/lib/biomarkers/ranges";

interface Props {
  value: number;
  range: BiomarkerRange;
  status: RangeStatus;
}

const STATUS_COLORS: Record<RangeStatus, string> = {
  optimal: "#22c55e",   // green-500
  normal: "#86efac",    // green-300
  borderline: "#f97316", // orange-500
  abnormal: "#ef4444",  // red-500
  unknown: "#6b7280",   // gray-500
};

const STATUS_LABELS: Record<RangeStatus, string> = {
  optimal: "Optimal",
  normal: "Normal",
  borderline: "Borderline",
  abnormal: "Out of range",
  unknown: "No reference",
};

export default function RangeBar({ value, range, status }: Props) {
  const { displayMin, displayMax, normalLow, normalHigh, optimalLow, optimalHigh } = range;
  const span = displayMax - displayMin;

  // Positions as percentages across the bar
  const toPct = (v: number) =>
    Math.max(0, Math.min(100, ((v - displayMin) / span) * 100));

  const normalLowPct = toPct(normalLow);
  const normalHighPct = toPct(normalHigh);
  const valuePct = toPct(value);

  // Optional optimal zone inside the normal zone
  const hasOptimal = optimalLow !== undefined && optimalHigh !== undefined;
  const optLowPct = hasOptimal ? toPct(optimalLow!) : normalLowPct;
  const optHighPct = hasOptimal ? toPct(optimalHigh!) : normalHighPct;

  const indicatorColor = STATUS_COLORS[status];

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      {/* Bar */}
      <div className="relative flex-1 h-2 rounded-full overflow-visible" style={{ minWidth: 100 }}>
        {/* Background track: red → orange → green → orange → red */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(to right,
              #ef4444 0%,
              #f97316 ${normalLowPct * 0.8}%,
              #22c55e ${normalLowPct}%,
              ${hasOptimal ? `#22c55e ${optLowPct}%, #16a34a ${optLowPct}%, #16a34a ${optHighPct}%, #22c55e ${optHighPct}%,` : ""}
              #22c55e ${normalHighPct}%,
              #f97316 ${Math.min(100, normalHighPct + (100 - normalHighPct) * 0.2)}%,
              #ef4444 100%)`,
          }}
        />

        {/* Value indicator: small circle that sits on top */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-black shadow-sm z-10"
          style={{
            left: `calc(${valuePct}% - 6px)`,
            backgroundColor: indicatorColor,
          }}
        />
      </div>

      {/* Status badge */}
      <span
        className="text-xs font-medium whitespace-nowrap shrink-0"
        style={{ color: indicatorColor }}
      >
        {STATUS_LABELS[status]}
      </span>
    </div>
  );
}
