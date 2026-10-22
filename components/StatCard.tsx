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
    <div className="rounded-md border border-pwr-dark-blue/10 bg-white px-2.5 py-2">
      <p className="truncate text-[10px] font-medium tracking-wide text-pwr-blue/50 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-base leading-tight font-semibold text-pwr-dark-blue">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] leading-snug text-pwr-blue/40">{hint}</p>}
    </div>
  );
}
