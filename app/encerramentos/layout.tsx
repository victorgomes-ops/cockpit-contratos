import { Suspense, type ReactNode } from "react";
import { SubAbas } from "@/components/SubAbas";

export default function EncerramentosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-6 py-6">
      <div className="nao-imprimir">
        <h1 className="text-lg font-semibold text-pwr-dark-blue">Encerramentos</h1>
        <Suspense fallback={<div className="mt-2.5 h-8 border-b border-pwr-dark-blue/10" />}>
          <SubAbas />
        </Suspense>
      </div>
      {children}
    </div>
  );
}
