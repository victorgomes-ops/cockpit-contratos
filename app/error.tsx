"use client";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-pwr-dark-blue">
        Não foi possível carregar os dados
      </h1>
      <p className="mt-2 text-sm text-pwr-blue/70">{error.message}</p>
      <p className="mt-4 text-xs text-pwr-blue/50">
        Verifique as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </p>
    </div>
  );
}
