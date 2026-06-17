"use client";

import { useState } from "react";
import { PANEL_ORDER, groupByPanel } from "@/lib/biomarkers/panels";
import { getRangeForMarker, getRangeStatus } from "@/lib/biomarkers/ranges";
import RangeBar from "./RangeBar";

interface Biomarker {
  id: string;
  type: string;
  value: number;
  unit: string;
  source: string;
}

interface Props {
  biomarkers: Biomarker[];
}

export default function SnapshotTable({ biomarkers }: Props) {
  const grouped = groupByPanel(biomarkers);
  const availablePanels = PANEL_ORDER.filter((p) => grouped.has(p));

  const [activePanel, setActivePanel] = useState<string>(
    availablePanels[0] ?? "Other"
  );

  if (biomarkers.length === 0) {
    return <p className="text-gray-500 text-sm">No data for this date.</p>;
  }

  const rows = grouped.get(activePanel) ?? [];

  return (
    <div className="space-y-4">
      {/* Panel tabs */}
      {availablePanels.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {availablePanels.map((panel) => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activePanel === panel
                  ? "border-white text-white bg-white/5"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {panel}
              <span className="ml-1.5 text-gray-600">
                {grouped.get(panel)!.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-500">
              <th className="pb-2 pr-6 font-medium">Marker</th>
              <th className="pb-2 pr-4 font-medium text-right">Value</th>
              <th className="pb-2 pr-6 font-medium">Unit</th>
              <th className="pb-2 font-medium">Range</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const range = getRangeForMarker(b.type);
              const status = range ? getRangeStatus(b.value, range) : "unknown";
              return (
                <tr
                  key={b.id}
                  className="border-b border-gray-800/40 hover:bg-gray-900/40 transition-colors"
                >
                  <td className="py-3 pr-6 text-gray-200">{b.type}</td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums">
                    <ValueWithColor value={b.value} status={status} />
                  </td>
                  <td className="py-3 pr-6 text-gray-500 text-xs">{b.unit}</td>
                  <td className="py-3">
                    {range ? (
                      <RangeBar value={b.value} range={range} status={status} />
                    ) : (
                      <span className="text-gray-700 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-green-600" />
          Optimal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
          Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
          Borderline
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
          Out of range
        </span>
      </div>
    </div>
  );
}

// Inline value colored by status
function ValueWithColor({
  value,
  status,
}: {
  value: number;
  status: ReturnType<typeof getRangeStatus>;
}) {
  const color = {
    optimal: "text-green-400",
    normal: "text-green-300",
    borderline: "text-orange-400",
    abnormal: "text-red-400",
    unknown: "text-gray-200",
  }[status];

  return <span className={color}>{value}</span>;
}
