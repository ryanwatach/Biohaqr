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
  if (biomarkers.length === 0) {
    return <p className="text-gray-500 text-sm">No data for this date.</p>;
  }

  return (
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
          {biomarkers.map((b) => (
            <tr key={b.id} className="border-b border-gray-800/40 hover:bg-gray-900/40 transition-colors">
              <td className="py-2.5 pr-6 text-gray-200">{b.type}</td>
              <td className="py-2.5 pr-4 text-right font-mono tabular-nums">{b.value}</td>
              <td className="py-2.5 pr-4 text-gray-500">{b.unit}</td>
              <td className="py-2.5 text-gray-600 text-xs capitalize">{b.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
