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
    <div className="rounded-lg border border-pwr-dark-blue/10 bg-white px-3.5 py-3">
      <p className="text-[11px] font-medium tracking-wide text-pwr-blue/55 uppercase">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-pwr-dark-blue">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] leading-snug text-pwr-blue/45">{hint}</p>}
    </div>
  );
}
