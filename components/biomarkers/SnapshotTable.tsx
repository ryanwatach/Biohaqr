"use client";

import { useState } from "react";
import { PANEL_ORDER, groupByPanel } from "@/lib/biomarkers/panels";

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

  // Only show tabs that actually have data
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
              <th className="pb-2 pr-4 font-medium">Unit</th>
              <th className="pb-2 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr
                key={b.id}
                className="border-b border-gray-800/40 hover:bg-gray-900/40 transition-colors"
              >
                <td className="py-2.5 pr-6 text-gray-200">{b.type}</td>
                <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                  {b.value}
                </td>
                <td className="py-2.5 pr-4 text-gray-500">{b.unit}</td>
                <td className="py-2.5 text-gray-600 text-xs capitalize">
                  {b.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
