# Decisões do Cockpit SPWR

Log vivo — atualizar sempre que uma decisão nova for tomada ou uma pendência for
resolvida. Objetivo: qualquer sessão futura (humana ou Claude) retoma o projeto sem
precisar reconstruir o contexto do zero.

## Decididas

- **Local do código**: tudo dentro de `G:\Meu Drive\Victor Gomes\App_cockpitspwr`
  (pasta sincronizada pelo Google Drive), por escolha explícita do Victor — mesmo
  sabendo do risco de lentidão/corrupção de arquivos do `node_modules` durante `npm
  install` (já aconteceu uma vez; resolvido com reinstalação limpa). Se voltar a
  acontecer, considerar excluir `node_modules`/`.next` da sincronização do Drive
  Desktop, ou mover só o código para fora do Drive.
- **Supabase**: usar o projeto já existente `alocacao-pwr-br`
  (`lwqpkamklzufhinhfozo`), compartilhado com o App-Alocacoes. **Somente leitura,
  nunca escrita/DDL** — regra inegociável do usuário.
- **Fonte de dados do MVP**: ler o JSON resumido já sincronizado em `base_dados`
  (`tipo='contratos'`, 7 campos), em vez de criar tabelas novas — decisão do usuário,
  mesmo sabendo que esse JSON não tem `Data de Renovação`, `Aceite do Cliente` nem
  valores.
- **Escopo do dia 1**: estrutura local funcionando, sem login, sem métricas inventadas
  a partir de campos que não existem na base atual (renovações e clientes ficam "em
  breve" na UI).
- **GitHub + Vercel**: repositório `victorgomes-ops/cockpit-contratos` e projeto Vercel
  `cockpit-contratos` (team `victorgomes-8807s-projects`) já criados pelo usuário — o
  objetivo é manter os três (GitHub, Vercel, Supabase) sincronizados.
- **Identidade visual**: paleta oficial PWR (laranja/azul escuro/branco), sem
  verde/amarelo/roxo/rosa.
- **Deploy inicial feito** (23/08/2026): push para GitHub (merge sem force-push com o
  placeholder inicial), projeto Vercel linkado, env vars do Supabase configuradas em
  production/preview/development, deploy de produção validado. `npm run dev` local
  confirma os mesmos números batendo com o Supabase (1653 contratos; Ativo 333 /
  Inativo 1212 / Stand By 33 / Cancelado 66 / Pendente 9; Fortaleza 1051 / ACG 305 /
  São Paulo 250 / Sem informação 47).
- **Proteção do deploy**: o projeto Vercel tem `ssoProtection: all_except_custom_domains`
  — só quem tem acesso ao time `victorgomes-8807s-projects` no Vercel abre
  `cockpit-contratos.vercel.app`. Isso substitui a necessidade de login na própria
  aplicação por enquanto (uso interno). Se um dia precisar liberar para mais gente sem
  dar acesso ao time Vercel, revisar essa proteção ou adicionar autenticação na
  aplicação.
- **Risco confirmado do Drive**: `npm install` direto na pasta sincronizada corrompeu
  arquivos duas vezes (`ENOTEMPTY`, `Invalid package config`) — não é intermitente.
  Solução usada: instalar em pasta local temporária e copiar com `robocopy /E /R:5 /W:2`
  (tem retry automático, ao contrário de `mv`/`cp`). Se precisar reinstalar
  dependências no futuro, repetir esse processo em vez de rodar `npm install` direto
  na pasta do Drive.

## Em aberto (não decidir sozinho — esperar o usuário)

- **Estratégia de ingestão completa**: como trazer os 50 campos de `Contratos.xlsx` e
  os 26 de `Clientes.xlsx` para o cockpit (tabelas novas dedicadas? mais um `tipo` em
  `base_dados`? outra abordagem?). O usuário disse que vai ensinar isso usando a skill
  dele `spwr-bi-analyst` — não inventar essa estratégia antes dessa conversa.
- **Definição de "projeto aceito"**: se é `Aceite do Cliente = Sim`, `Status do
  Projeto`, ou uma combinação — também fica para a sessão com a skill
  `spwr-bi-analyst`.
- **Definição de "renovação do mês"**: qual campo usar (`Data de Renovação` vs `Data
  Término Vendido` vs `Data Término Previsto`) e a regra de negócio por trás.
- **Autenticação**: hoje sem login (uso interno, só o Victor). Reavaliar se mais gente
  for acessar o cockpit.
- **RLS desabilitado no Supabase**: as 3 tabelas do projeto (`projecao`, `base_dados`,
  `projeto_status`) estão com Row Level Security desligado — qualquer chave `anon` lê
  e escreve tudo. Não mexer sem o usuário decidir (pode afetar o App-Alocacoes). SQL de
  remediação, se um dia for aplicado (não aplicar sem aprovação explícita):
  ```sql
  ALTER TABLE public.projecao ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.base_dados ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.projeto_status ENABLE ROW LEVEL SECURITY;
  ```
  (precisa de políticas de acesso definidas antes, senão bloqueia tudo).

## Referências rápidas

- Bases de origem (Drive): `G:\.shortcut-targets-by-id\0B79q2rIj_NxpekNXZHFnSnpRY2c\2.
  Dir. OP\1 - Atualização Periódica\Bases SPWR` — usar `Contratos.xlsx` e
  `Clientes.xlsx` por enquanto; outras bases na mesma pasta (Alocações, Débitos BH,
  Usuários, Base de Horas) ficam para depois.
- Supabase URL: `https://lwqpkamklzufhinhfozo.supabase.co`
- Skill do usuário para regras de negócio SPWR: `spwr-bi-analyst`
