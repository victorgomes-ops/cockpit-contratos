import type { ReactNode } from "react";
import { SubAbas } from "@/components/SubAbas";

export default function EncerramentosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 py-6">
      <h1 className="text-lg font-semibold text-pwr-dark-blue">Encerramentos</h1>
      <SubAbas />
      {children}
    </div>
  );
}
