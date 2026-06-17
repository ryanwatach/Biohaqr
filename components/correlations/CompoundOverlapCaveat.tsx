interface Props {
  otherCompounds: string[];
  selectedCompoundName: string;
  windowDays: number;
}

export default function CompoundOverlapCaveat({
  otherCompounds,
  selectedCompoundName,
  windowDays,
}: Props) {
  if (otherCompounds.length === 0) return null;

  const others =
    otherCompounds.length === 1
      ? `[${otherCompounds[0]}]`
      : otherCompounds
          .slice(0, -1)
          .map((c) => `[${c}]`)
          .join(", ") + ` and [${otherCompounds[otherCompounds.length - 1]}]`;

  const pronoun = otherCompounds.length === 1 ? "that compound" : "those compounds";
  const combo = otherCompounds.length === 1 ? "or by both" : "or by some combination";

  return (
    <div className="border border-amber-600/50 bg-amber-950/30 rounded-lg p-4 space-y-1">
      <p className="text-amber-400 font-medium text-sm">⚠ Confounded window</p>
      <p className="text-amber-200/80 text-sm leading-relaxed">
        You were also logging {others} during this {windowDays}-day window. Any change in
        the numbers below could be driven by {pronoun}, by{" "}
        <span className="font-semibold">[{selectedCompoundName}]</span>, {combo} — this
        comparison can&apos;t isolate which.
      </p>
    </div>
  );
}
