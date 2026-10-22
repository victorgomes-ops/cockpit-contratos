export function ComingSoonCard({ title, note }: { title: string; note: string }) {
  return (
    <div className="rounded-lg border border-dashed border-pwr-orange/30 bg-pwr-orange/[0.04] px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wide text-pwr-dark-blue uppercase">
          {title}
        </p>
        <span className="rounded-full bg-pwr-orange/10 px-1.5 py-0.5 text-[10px] font-semibold text-pwr-orange">
          Em breve
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-pwr-blue/50">{note}</p>
    </div>
  );
}
