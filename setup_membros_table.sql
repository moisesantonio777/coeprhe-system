-- Cria a tabela de membros se ela não existir
create table if not exists public.membros (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text,
  telefone text,
  cargo text,
  status text default 'ativo',
  created_at timestamp default now()
);

-- Garante que as colunas existam se a tabela já existir
alter table public.membros add column if not exists email text;
alter table public.membros add column if not exists telefone text;
alter table public.membros add column if not exists cargo text;
alter table public.membros add column if not exists status text default 'ativo';

-- Habilita Segurança (RLS)
alter table public.membros enable row level security;

-- Cria política de acesso para usuários autenticados
drop policy if exists "Acesso total para autenticados" on public.membros;
create policy "Acesso total para autenticados" 
on public.membros for all 
to authenticated 
using (true)
with check (true);
