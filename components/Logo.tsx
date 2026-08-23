export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const isLight = variant === "light";
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pwr-orange text-sm font-bold text-white">
        &gt;
      </span>
      <span className="text-lg leading-none font-semibold">
        <span className={isLight ? "text-white" : "text-pwr-dark-blue"}>pwr</span>{" "}
        <span className={isLight ? "text-white/60" : "text-gray-400"}>GESTÃO</span>
      </span>
    </div>
  );
}
