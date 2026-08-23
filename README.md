# Cockpit SPWR

Painel interno da PWR Gestão para acompanhar contratos, renovações e clientes a partir
das bases do Sistema SPWR. Feito com Next.js (App Router) + Tailwind, lendo dados do
Supabase que já sustenta o app "App-Alocacoes".

## Regra mais importante deste projeto

**Este app só lê o Supabase. Nunca escreve.** O projeto `alocacao-pwr-br`
(`lwqpkamklzufhinhfozo`) é compartilhado com o App-Alocacoes — qualquer `insert`,
`update`, `delete` ou `upsert` feito por engano aqui pode quebrar o outro app. Toda
função em `lib/queries/` deve usar só `.select(...)`.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Precisa de um `.env.local` com:

```
NEXT_PUBLIC_SUPABASE_URL=https://lwqpkamklzufhinhfozo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

(veja `.env.example`; a chave é a publishable key do projeto Supabase, obtida via MCP).

## Fontes de dados

- **Hoje**: `base_dados` (tabela genérica do Supabase, `tipo`/`dados jsonb`), registro
  `tipo='contratos'`, sincronizado por outro processo com 7 campos resumidos.
- **Origem completa** (ainda não ingerida): planilhas `Contratos.xlsx` (50 colunas) e
  `Clientes.xlsx` (26 colunas) em
  `G:\.shortcut-targets-by-id\0B79q2rIj_NxpekNXZHFnSnpRY2c\2. Dir. OP\1 - Atualização
  Periódica\Bases SPWR`, atualizadas periodicamente por Victor Gomes.

Veja [`docs/DECISIONS.md`](docs/DECISIONS.md) para o que já foi decidido e o que ainda
está em aberto (principalmente: estratégia de ingestão completa e regras de negócio como
definição de "projeto aceito" e "renovação").

## Infraestrutura

- **GitHub**: victorgomes-ops/cockpit-contratos
- **Deploy**: Vercel — projeto `cockpit-contratos` (team `victorgomes-8807s-projects`)
- **Banco**: Supabase `alocacao-pwr-br` (somente leitura)

## Identidade visual

Paleta oficial PWR aplicada via Tailwind (`app/globals.css`): laranja `#FF5B00`, azul
escuro `#05244F`, azul médio `#273A76`, azul claro `#3C58B4`, branco `#FFFFFF`.
