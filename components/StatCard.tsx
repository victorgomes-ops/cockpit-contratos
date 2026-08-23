export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-pwr-dark-blue/10 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-pwr-blue/70">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-pwr-dark-blue">{value}</p>
      {hint && <p className="mt-1 text-xs text-pwr-blue/50">{hint}</p>}
    </div>
  );
}
