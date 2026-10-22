import { ContratosTable } from "@/components/ContratosTable";
import { getContratosResumo } from "@/lib/queries/contratos";

export default async function ContratosPage() {
  const { contratos } = await getContratosResumo();

  return (
    <div className="px-6 py-6">
      <h1 className="text-lg font-semibold text-pwr-dark-blue">Contratos</h1>
      <p className="mt-0.5 text-xs text-pwr-blue/50">
        {contratos.length} contratos — campos resumidos (fonte: base_dados no Supabase).
      </p>
      <div className="mt-4">
        <ContratosTable contratos={contratos} />
      </div>
    </div>
  );
}
