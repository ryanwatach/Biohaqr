"use client";

import { useState, useEffect, useCallback } from "react";
import CompoundOverlapCaveat from "./CompoundOverlapCaveat";

interface Compound {
  id: string;
  name: string;
}

interface BeforeAfterResult {
  markerDate: string;
  windowStart: string;
  windowEnd: string;
  windowDays: number;
  beforeAvg: number | null;
  beforeCount: number;
  afterAvg: number | null;
  afterCount: number;
  unit: string;
  otherCompounds: string[];
  selectedCompoundName: string;
}

interface Props {
  compounds: Compound[];
  initialCompoundId?: string;
  initialBiomarker?: string;
  biomarkerTypes: string[];
}

function round2(n: number | null) {
  if (n === null) return null;
  return Math.round(n * 100) / 100;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BeforeAfterComparison({
  compounds,
  initialCompoundId,
  initialBiomarker,
  biomarkerTypes,
}: Props) {
  const [compoundId, setCompoundId] = useState(initialCompoundId ?? compounds[0]?.id ?? "");
  const [biomarker, setBiomarker] = useState(initialBiomarker ?? biomarkerTypes[0] ?? "");
  const [windowDays, setWindowDays] = useState(14);
  const [result, setResult] = useState<BeforeAfterResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchResult = useCallback(async () => {
    if (!compoundId || !biomarker) return;
    setStatus("loading");
    setErrorMsg("");
    const params = new URLSearchParams({
      compoundId,
      biomarker,
      window: String(windowDays),
    });
    const res = await fetch(`/api/correlations/before-after?${params}`);
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(data.error ?? "Failed to load comparison");
      setResult(null);
      return;
    }
    setResult(data);
    setStatus("idle");
  }, [compoundId, biomarker, windowDays]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  if (compounds.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        Log some compounds first to see before/after comparisons.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-xs text-gray-500 block">Compound</label>
          <select
            value={compoundId}
            onChange={(e) => setCompoundId(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500"
          >
            {compounds.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 block">Biomarker</label>
          <select
            value={biomarker}
            onChange={(e) => setBiomarker(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500"
          >
            {biomarkerTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-500 block">Window (days)</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={7}
              max={90}
              step={7}
              value={windowDays}
              onChange={(e) => setWindowDays(parseInt(e.target.value, 10))}
              className="w-28 accent-white"
            />
            <span className="text-sm text-gray-300 w-8">{windowDays}</span>
          </div>
        </div>
      </div>

      {status === "loading" && <p className="text-gray-500 text-sm">Loading…</p>}
      {status === "error" && <p className="text-red-400 text-sm">{errorMsg}</p>}

      {result && status !== "loading" && (
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            First logged: {formatDate(result.markerDate)} · Window:{" "}
            {formatDate(result.windowStart)} → {formatDate(result.windowEnd)}
          </p>

          {/* Caveat — above the numbers, same visual weight */}
          <CompoundOverlapCaveat
            otherCompounds={result.otherCompounds}
            selectedCompoundName={result.selectedCompoundName}
            windowDays={result.windowDays}
          />

          {/* Before / After cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-800 rounded-lg p-4 space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Before avg
              </p>
              {result.beforeAvg !== null ? (
                <p className="text-2xl font-mono tabular-nums">
                  {round2(result.beforeAvg)}
                  <span className="text-sm text-gray-500 ml-1">{result.unit}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-600">No data in this window</p>
              )}
              <p className="text-xs text-gray-600">
                {result.beforeCount} data point{result.beforeCount !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="border border-gray-800 rounded-lg p-4 space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                After avg
              </p>
              {result.afterAvg !== null ? (
                <p className="text-2xl font-mono tabular-nums">
                  {round2(result.afterAvg)}
                  <span className="text-sm text-gray-500 ml-1">{result.unit}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-600">No data in this window</p>
              )}
              <p className="text-xs text-gray-600">
                {result.afterCount} data point{result.afterCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
