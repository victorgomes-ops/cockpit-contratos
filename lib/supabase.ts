import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltam as variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// Cliente somente leitura: este projeto nunca deve chamar insert/update/delete/upsert
// contra o Supabase compartilhado com o App-Alocacoes.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
