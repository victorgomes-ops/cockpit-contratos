import { ContratosTable } from "@/components/ContratosTable";
import { getContratosResumo } from "@/lib/queries/contratos";

export default async function ContratosPage() {
  const { contratos } = await getContratosResumo();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-pwr-dark-blue">Contratos</h1>
      <p className="mt-1 text-sm text-pwr-blue/60">
        {contratos.length} contratos — campos resumidos (fonte: base_dados no Supabase).
      </p>
      <div className="mt-6">
        <ContratosTable contratos={contratos} />
      </div>
    </div>
  );
}
