create table if not exists public.familias_atingidas (
  id uuid primary key default gen_random_uuid(),

  ihu text,

  nome_responsavel text not null,
  cpf varchar(11) not null unique,
  telefone varchar(11),

  cep varchar(8) not null,
  logradouro text not null,
  numero text not null,
  complemento text,
  bairro text not null,
  estado char(2) not null,
  municipio text not null,

  total_moradores integer not null default 1,

  criancas integer not null default 0,
  adolescentes integer not null default 0,
  adultos integer not null default 0,
  idosos integer not null default 0,

  pcd integer not null default 0,
  gestantes integer not null default 0,
  bebes integer not null default 0,

  situacao_moradia text not null,

  renda_familiar_estimada numeric(12,2),

  ocupacao_responsavel text,

  perda_renda boolean not null default false,

  necessidades_prioritarias text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_familias()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_familias_updated_at on public.familias_atingidas;

create trigger trg_familias_updated_at
before update on public.familias_atingidas
for each row
execute function public.set_updated_at_familias();

create table if not exists public.empresas_afetadas (
  id uuid primary key default gen_random_uuid(),

  nome_empresa text not null,

  cnpj varchar(14) not null unique,

  estado char(2) not null,
  municipio text not null,

  setor_economico text not null,

  numero_funcionarios integer not null default 0,

  tipo_impacto text not null,

  prejuizo_estimado numeric(14,2),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_empresas()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_empresas_updated_at on public.empresas_afetadas;

create trigger trg_empresas_updated_at
before update on public.empresas_afetadas
for each row
execute function public.set_updated_at_empresas();

create table if not exists public.voluntarios_ativos (
  id uuid primary key default gen_random_uuid(),

  nome text not null,

  cpf varchar(11) not null unique,

  telefone varchar(11),

  estado char(2) not null,
  municipio text not null,

  centro_atuacao text not null,

  funcao_desempenhada text not null,

  horas_trabalhadas numeric(10,2) not null default 0,

  data_inicio date not null,
  data_fim date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_voluntarios()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_voluntarios_updated_at on public.voluntarios_ativos;

create trigger trg_voluntarios_updated_at
before update on public.voluntarios_ativos
for each row
execute function public.set_updated_at_voluntarios();

create index idx_familias_nome on familias_atingidas(nome_responsavel);
create index idx_familias_municipio on familias_atingidas(municipio);

create index idx_empresas_nome on empresas_afetadas(nome_empresa);
create index idx_empresas_municipio on empresas_afetadas(municipio);

create index idx_voluntarios_nome on voluntarios_ativos(nome);
create index idx_voluntarios_municipio on voluntarios_ativos(municipio);

create table if not exists public.moradias_afetadas (
  id uuid primary key default gen_random_uuid(),

  familia_id uuid references public.familias_atingidas(id) on delete set null,

  cep varchar(8),
  logradouro text not null,
  numero text not null,
  complemento text,
  bairro text not null,
  estado char(2) not null,
  municipio text not null,

  tipo_dano text not null,
  risco_estrutural text not null,
  necessidade_reconstrucao boolean not null default false,
  familias_afetadas integer not null default 1,

  latitude numeric(10,7),
  longitude numeric(10,7),

  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_moradias()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_moradias_updated_at on public.moradias_afetadas;

create trigger trg_moradias_updated_at
before update on public.moradias_afetadas
for each row
execute function public.set_updated_at_moradias()

create index idx_moradias_municipio on moradias_afetadas(municipio);
create index idx_moradias_bairro on moradias_afetadas(bairro);
create index idx_moradias_logradouro on moradias_afetadas(logradouro);

create table if not exists public.programas_governamentais (
  id uuid primary key default gen_random_uuid(),

  nome_programa text not null,
  esfera text not null,
  orgao_responsavel text not null,

  estado char(2),
  municipio text,

  numero_familias_atendidas integer not null default 0,
  valor_total_distribuido numeric(14,2) not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_programas()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_programas_updated_at on public.programas_governamentais;

create trigger trg_programas_updated_at
before update on public.programas_governamentais
for each row
execute function public.set_updated_at_programas();

create index idx_programas_nome on programas_governamentais(nome_programa);
create index idx_programas_municipio on programas_governamentais(municipio);

create table if not exists public.beneficios_por_familia (
  id uuid primary key default gen_random_uuid(),

  familia_id uuid not null references public.familias_atingidas(id) on delete cascade,
  programa_id uuid references public.programas_governamentais(id) on delete set null,

  tipo_beneficio text not null,
  valor_quantidade numeric(14,2) not null default 0,
  data_concessao date not null,
  orgao_pagador_distribuidor text not null,

  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_beneficios()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_beneficios_updated_at on public.beneficios_por_familia;

create trigger trg_beneficios_updated_at
before update on public.beneficios_por_familia
for each row
execute function public.set_updated_at_beneficios();

create index idx_beneficios_familia on beneficios_por_familia(familia_id);
create index idx_beneficios_programa on beneficios_por_familia(programa_id);
create index idx_beneficios_tipo on beneficios_por_familia(tipo_beneficio);

--------------------------------------------------------------------------------
--           doacoes_recebidas
--------------------------------------------------------------------------------

create table if not exists public.doacoes_recebidas (
  id uuid primary key default gen_random_uuid(),

  data_recebimento date not null,
  centro_distribuicao text not null,
  estado char(2) not null,
  municipio text not null,

  origem_doacao text,
  tipo_doador text not null,
  cpf_cnpj_doador varchar(14),

  categoria_item text not null,
  nome_item text not null,
  quantidade numeric(12,2) not null default 0,
  unidade_medida text not null,

  data_validade date,
  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_doacoes()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_doacoes_updated_at on public.doacoes_recebidas;

create trigger trg_doacoes_updated_at
before update on public.doacoes_recebidas
for each row
execute function public.set_updated_at_doacoes();

create index idx_doacoes_centro on doacoes_recebidas(centro_distribuicao);
create index idx_doacoes_item on doacoes_recebidas(nome_item);
create index idx_doacoes_categoria on doacoes_recebidas(categoria_item);
create index idx_doacoes_municipio on doacoes_recebidas(municipio);

--------------------------------------------------------------------------------
--           estoque_humanitario
--------------------------------------------------------------------------------

create table if not exists public.estoque_humanitario (
  id uuid primary key default gen_random_uuid(),

  centro_distribuicao text not null,
  estado char(2) not null,
  municipio text not null,

  categoria_item text not null,
  nome_item text not null,
  quantidade_estoque numeric(12,2) not null default 0,
  unidade text not null,

  data_entrada date not null,
  data_validade date,
  localizacao_estoque text,
  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_estoque()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_estoque_updated_at on public.estoque_humanitario;

create trigger trg_estoque_updated_at
before update on public.estoque_humanitario
for each row
execute function public.set_updated_at_estoque();

create index idx_estoque_centro on estoque_humanitario(centro_distribuicao);
create index idx_estoque_item on estoque_humanitario(nome_item);
create index idx_estoque_categoria on estoque_humanitario(categoria_item);
create index idx_estoque_municipio on estoque_humanitario(municipio);

--------------------------------------------------------------------------------
--           entregas_familias
--------------------------------------------------------------------------------

create table if not exists public.entregas_familias (
  id uuid primary key default gen_random_uuid(),

  familia_id uuid not null references public.familias_atingidas(id) on delete cascade,

  centro_distribuicao text not null,
  responsavel_entrega text not null,
  data_entrega date not null,

  nome_item text not null,
  categoria_item text not null,
  quantidade numeric(12,2) not null default 0,

  assinatura_digital text,
  foto_entrega text,
  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_entregas()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_entregas_updated_at on public.entregas_familias;

create trigger trg_entregas_updated_at
before update on public.entregas_familias
for each row
execute function public.set_updated_at_entregas();

create index idx_entregas_familia on entregas_familias(familia_id);
create index idx_entregas_centro on entregas_familias(centro_distribuicao);
create index idx_entregas_item on entregas_familias(nome_item);

--------------------------------------------------------------------------------
--           transferencias_centros
--------------------------------------------------------------------------------

create table if not exists public.transferencias_centros (
  id uuid primary key default gen_random_uuid(),

  centro_origem text not null,
  centro_destino text not null,

  data_transferencia date not null,

  nome_item text not null,
  categoria_item text not null,
  quantidade numeric(12,2) not null default 0,
  unidade text not null,

  responsavel_envio text not null,
  responsavel_recebimento text,

  status_transferencia text not null default 'enviado',

  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_transferencias()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_transferencias_updated_at on public.transferencias_centros;

create trigger trg_transferencias_updated_at
before update on public.transferencias_centros
for each row
execute function public.set_updated_at_transferencias();

create index idx_transferencias_origem on transferencias_centros(centro_origem);
create index idx_transferencias_destino on transferencias_centros(centro_destino);
create index idx_transferencias_item on transferencias_centros(nome_item);

--------------------------------------------------------------------------------
--           vaquinhas_online
--------------------------------------------------------------------------------

create table if not exists public.vaquinhas_online (
  id uuid primary key default gen_random_uuid(),

  plataforma_utilizada text not null,
  link_campanha text not null,
  responsavel text not null,

  estado char(2) not null,
  municipio_beneficiado text not null,

  valor_arrecadado numeric(14,2) not null default 0,
  valor_distribuido numeric(14,2) not null default 0,

  observacoes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at_vaquinhas()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_vaquinhas_updated_at on public.vaquinhas_online;

create trigger trg_vaquinhas_updated_at
before update on public.vaquinhas_online
for each row
execute function public.set_updated_at_vaquinhas();

create index idx_vaquinhas_plataforma on vaquinhas_online(plataforma_utilizada);
create index idx_vaquinhas_municipio on vaquinhas_online(municipio_beneficiado);
create index idx_vaquinhas_responsavel on vaquinhas_online(responsavel);

--------------------------------------------------------------------------------
--           
--------------------------------------------------------------------------------