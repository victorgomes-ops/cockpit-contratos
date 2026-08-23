export function ComingSoonCard({ title, note }: { title: string; note: string }) {
  return (
    <div className="rounded-xl border border-dashed border-pwr-orange/40 bg-pwr-orange/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-pwr-dark-blue">{title}</p>
        <span className="rounded-full bg-pwr-orange/10 px-2 py-0.5 text-xs font-semibold text-pwr-orange">
          Em breve
        </span>
      </div>
      <p className="mt-2 text-xs text-pwr-blue/60">{note}</p>
    </div>
  );
}
