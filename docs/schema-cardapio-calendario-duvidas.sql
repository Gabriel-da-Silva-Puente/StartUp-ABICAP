-- Rode este script no SQL Editor do Supabase (uma vez).
-- Se turma.id for UUID em vez de bigint, troque "bigint" por "uuid" em eventos_turmas.turma_id.

-- CARDÁPIO: uma linha por dia
create table if not exists cardapio (
    id bigint generated always as identity primary key,
    data date not null unique,
    cafe text,
    almoco text,
    lanche text,
    created_at timestamptz default now()
);

-- CALENDÁRIO
create table if not exists eventos (
    id bigint generated always as identity primary key,
    titulo text not null,
    descricao text,
    data date not null,
    tipo text not null default 'evento',
    todas_turmas boolean not null default false,
    created_at timestamptz default now()
);

create table if not exists eventos_turmas (
    evento_id bigint not null references eventos(id) on delete cascade,
    turma_id bigint not null references turma(id) on delete cascade,
    primary key (evento_id, turma_id)
);

-- CENTRAL DE DÚVIDAS
create table if not exists duvidas_topicos (
    id bigint generated always as identity primary key,
    titulo text not null,
    conteudo text not null,
    created_at timestamptz default now()
);

create table if not exists duvidas_config (
    id int primary key default 1 check (id = 1),
    texto_geral text
);
insert into duvidas_config (id, texto_geral) values (1, null) on conflict do nothing;

-- Políticas de acesso (mesmo modelo das outras tabelas do projeto, que usam a chave anon)
alter table cardapio enable row level security;
alter table eventos enable row level security;
alter table eventos_turmas enable row level security;
alter table duvidas_topicos enable row level security;
alter table duvidas_config enable row level security;

create policy "acesso total cardapio" on cardapio for all using (true) with check (true);
create policy "acesso total eventos" on eventos for all using (true) with check (true);
create policy "acesso total eventos_turmas" on eventos_turmas for all using (true) with check (true);
create policy "acesso total duvidas_topicos" on duvidas_topicos for all using (true) with check (true);
create policy "acesso total duvidas_config" on duvidas_config for all using (true) with check (true);
