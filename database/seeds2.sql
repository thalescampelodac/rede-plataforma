insert into public.familias_atingidas
(
  nome_responsavel,
  cpf,
  telefone,
  cep,
  logradouro,
  numero,
  complemento,
  bairro,
  estado,
  municipio,
  total_moradores,
  criancas,
  adolescentes,
  adultos,
  idosos,
  pcd,
  gestantes,
  bebes,
  situacao_moradia,
  renda_familiar_estimada,
  ocupacao_responsavel,
  perda_renda,
  necessidades_prioritarias
)
values
(
  'Rosângela Maria de Souza',
  '84736215001',
  '32999111001',
  '36037010',
  'Rua Padre Café',
  '142',
  '',
  'São Mateus',
  'MG',
  'Juiz de Fora',
  5,
  2,
  1,
  2,
  0,
  0,
  0,
  1,
  'desalojada',
  1800,
  'Auxiliar de limpeza',
  true,
  array['alimentos','agua','higiene']
),
(
  'Cláudio Henrique dos Santos',
  '84736215002',
  '32999111002',
  '36080020',
  'Rua Cesário Alvim',
  '87',
  '',
  'Vitorino Braga',
  'MG',
  'Juiz de Fora',
  4,
  1,
  1,
  2,
  0,
  0,
  0,
  0,
  'desabrigada',
  2200,
  'Motorista',
  true,
  array['alimentos','cobertores','limpeza']
),
(
  'Mariana Ferreira Lima',
  '84736215003',
  '32999111003',
  '36036090',
  'Rua Morais e Castro',
  '311',
  'Casa fundos',
  'Passos',
  'MG',
  'Juiz de Fora',
  3,
  1,
  0,
  2,
  0,
  0,
  1,
  0,
  'area_risco',
  1600,
  'Vendedora',
  true,
  array['acolhimento','atendimento_social']
),
(
  'Valter Rodrigues de Oliveira',
  '84736215004',
  '32999111004',
  '36026030',
  'Rua Batista de Oliveira',
  '509',
  '',
  'Centro',
  'MG',
  'Juiz de Fora',
  2,
  0,
  0,
  1,
  1,
  0,
  0,
  0,
  'danificada',
  3100,
  'Porteiro',
  false,
  array['limpeza','medicamentos']
),
(
  'Eliane Cristina Campos',
  '84736215005',
  '32999111005',
  '36100040',
  'Rua Bernardo Mascarenhas',
  '220',
  '',
  'Fábrica',
  'MG',
  'Juiz de Fora',
  6,
  2,
  1,
  2,
  1,
  1,
  0,
  1,
  'desabrigada',
  2500,
  'Costureira',
  true,
  array['alimentos','agua','higiene','cobertores']
),
(
  'Paulo César Moreira',
  '84736215006',
  '32999111006',
  '36570000',
  'Rua Santa Rita',
  '18',
  '',
  'Centro',
  'MG',
  'Cataguases',
  4,
  1,
  1,
  2,
  0,
  0,
  0,
  0,
  'desalojada',
  2700,
  'Mecânico',
  true,
  array['alimentos','limpeza']
),
(
  'Denise Alves Ribeiro',
  '84736215007',
  '32999111007',
  '36880000',
  'Rua Coronel Domiciano',
  '94',
  '',
  'Centro',
  'MG',
  'Muriaé',
  5,
  2,
  0,
  2,
  1,
  0,
  0,
  0,
  'destruida',
  1900,
  'Cozinheira',
  true,
  array['acolhimento','material_construcao','agua']
),
(
  'André Luiz Cardoso',
  '84736215008',
  '32999111008',
  '36700000',
  'Rua Tiradentes',
  '55',
  '',
  'Centro',
  'MG',
  'Leopoldina',
  3,
  0,
  1,
  2,
  0,
  0,
  0,
  0,
  'area_risco',
  2800,
  'Servidor terceirizado',
  true,
  array['atendimento_social','cobertores']
),
(
  'Jéssica Aparecida Martins',
  '84736215009',
  '32999111009',
  '36500000',
  'Rua XV de Novembro',
  '73',
  '',
  'Centro',
  'MG',
  'Ubá',
  4,
  1,
  1,
  2,
  0,
  0,
  0,
  0,
  'desabrigada',
  2100,
  'Atendente',
  true,
  array['alimentos','agua','higiene']
),
(
  'Sebastião Geraldo Fonseca',
  '84736215010',
  '32999111010',
  '36660000',
  'Rua Doutor Fialho',
  '28',
  '',
  'Centro',
  'MG',
  'Além Paraíba',
  2,
  0,
  0,
  1,
  1,
  0,
  0,
  0,
  'danificada',
  1700,
  'Aposentado',
  false,
  array['medicamentos','limpeza']
),
(
  'Patrícia Helena Dias',
  '84736215011',
  '32999111011',
  '36200000',
  'Rua Duque de Caxias',
  '141',
  '',
  'Centro',
  'MG',
  'Barbacena',
  5,
  2,
  1,
  2,
  0,
  0,
  0,
  0,
  'desalojada',
  2400,
  'Merendeira',
  true,
  array['alimentos','agua','cobertores']
),
(
  'Fábio Augusto Nogueira',
  '84736215012',
  '32999111012',
  '36152000',
  'Rua Doutor Costa Reis',
  '260',
  '',
  'Mundo Novo',
  'MG',
  'Juiz de Fora',
  6,
  2,
  2,
  2,
  0,
  1,
  0,
  0,
  'desabrigada',
  2300,
  'Pedreiro',
  true,
  array['alimentos','agua','material_construcao']
);

insert into public.moradias_afetadas
(
  familia_id,
  cep,
  logradouro,
  numero,
  complemento,
  bairro,
  estado,
  municipio,
  tipo_dano,
  risco_estrutural,
  necessidade_reconstrucao,
  familias_afetadas,
  latitude,
  longitude,
  observacoes
)
select
  f.id,
  '36037010',
  'Rua Padre Café',
  '142',
  '',
  'São Mateus',
  'MG',
  'Juiz de Fora',
  'alagamento',
  'medio',
  false,
  2,
  -21.7669000,
  -43.3578000,
  'Ponto com recorrência de alagamento e perda de móveis.'
from familias_atingidas f
where f.cpf = '84736215001'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36080020',
  'Rua Cesário Alvim',
  '87',
  '',
  'Vitorino Braga',
  'MG',
  'Juiz de Fora',
  'deslizamento',
  'alto',
  true,
  1,
  -21.7515000,
  -43.3335000,
  'Encosta instável e imóvel parcialmente comprometido.'
from familias_atingidas f
where f.cpf = '84736215002'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36036090',
  'Rua Morais e Castro',
  '311',
  'Casa fundos',
  'Passos',
  'MG',
  'Juiz de Fora',
  'rachaduras_estruturais',
  'medio',
  true,
  1,
  -21.7708000,
  -43.3513000,
  'Rachaduras em paredes e recalque perceptível.'
from familias_atingidas f
where f.cpf = '84736215003'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36026030',
  'Rua Batista de Oliveira',
  '509',
  '',
  'Centro',
  'MG',
  'Juiz de Fora',
  'alagamento',
  'baixo',
  false,
  1,
  -21.7606000,
  -43.3487000,
  'Danos leves com necessidade de limpeza e reparo.'
from familias_atingidas f
where f.cpf = '84736215004'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36100040',
  'Rua Bernardo Mascarenhas',
  '220',
  '',
  'Fábrica',
  'MG',
  'Juiz de Fora',
  'desabamento_parcial',
  'alto',
  true,
  3,
  -21.7481000,
  -43.3642000,
  'Cobertura comprometida e áreas interditadas.'
from familias_atingidas f
where f.cpf = '84736215005'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36570000',
  'Rua Santa Rita',
  '18',
  '',
  'Centro',
  'MG',
  'Cataguases',
  'alagamento',
  'medio',
  false,
  2,
  -21.3896000,
  -42.6965000,
  'Região central com recorrência de enchente.'
from familias_atingidas f
where f.cpf = '84736215006'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36880000',
  'Rua Coronel Domiciano',
  '94',
  '',
  'Centro',
  'MG',
  'Muriaé',
  'desabamento_total',
  'alto',
  true,
  4,
  -21.1303000,
  -42.3662000,
  'Imóvel perdido integralmente após evento extremo.'
from familias_atingidas f
where f.cpf = '84736215007'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36700000',
  'Rua Tiradentes',
  '55',
  '',
  'Centro',
  'MG',
  'Leopoldina',
  'interdicao',
  'alto',
  true,
  1,
  -21.5297000,
  -42.6439000,
  'Área interditada pela defesa civil.'
from familias_atingidas f
where f.cpf = '84736215008'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36500000',
  'Rua XV de Novembro',
  '73',
  '',
  'Centro',
  'MG',
  'Ubá',
  'deslizamento',
  'alto',
  true,
  2,
  -21.1209000,
  -42.9427000,
  'Solo encharcado e comprometimento do lote.'
from familias_atingidas f
where f.cpf = '84736215009'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36660000',
  'Rua Doutor Fialho',
  '28',
  '',
  'Centro',
  'MG',
  'Além Paraíba',
  'destelhamento',
  'baixo',
  false,
  1,
  -21.8878000,
  -42.7046000,
  'Danos no telhado e infiltrações.'
from familias_atingidas f
where f.cpf = '84736215010'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36200000',
  'Rua Duque de Caxias',
  '141',
  '',
  'Centro',
  'MG',
  'Barbacena',
  'alagamento',
  'medio',
  false,
  2,
  -21.2256000,
  -43.7708000,
  'Acúmulo de água e danos internos.'
from familias_atingidas f
where f.cpf = '84736215011'
limit 1;

insert into public.moradias_afetadas
(
  familia_id, cep, logradouro, numero, complemento, bairro, estado, municipio,
  tipo_dano, risco_estrutural, necessidade_reconstrucao, familias_afetadas,
  latitude, longitude, observacoes
)
select
  f.id,
  '36152000',
  'Rua Doutor Costa Reis',
  '260',
  '',
  'Mundo Novo',
  'MG',
  'Juiz de Fora',
  'desabamento_parcial',
  'alto',
  true,
  3,
  -21.7424000,
  -43.3812000,
  'Ponto crítico com alto adensamento e danos severos.'
from familias_atingidas f
where f.cpf = '84736215012'
limit 1;

insert into public.entregas_familias
(
  familia_id,
  centro_distribuicao,
  responsavel_entrega,
  data_entrega,
  nome_item,
  categoria_item,
  quantidade,
  assinatura_digital,
  foto_entrega,
  observacoes
)
select
  f.id,
  'Centro JF Norte',
  'Carlos Henrique Mendes',
  '2024-03-20',
  'Cesta básica',
  'alimentos',
  2,
  'assinatura_rosangela',
  null,
  'Entrega complementar para núcleo familiar com crianças'
from familias_atingidas f
where f.cpf = '84736215001'
limit 1;

insert into public.entregas_familias
(
  familia_id, centro_distribuicao, responsavel_entrega, data_entrega,
  nome_item, categoria_item, quantidade, assinatura_digital, foto_entrega, observacoes
)
select
  f.id,
  'Centro JF Sul',
  'Patricia Gomes Ferreira',
  '2024-03-20',
  'Kit de higiene pessoal',
  'higiene',
  1,
  'assinatura_claudio',
  null,
  'Entrega imediata em ponto de apoio'
from familias_atingidas f
where f.cpf = '84736215002'
limit 1;

insert into public.entregas_familias
(
  familia_id, centro_distribuicao, responsavel_entrega, data_entrega,
  nome_item, categoria_item, quantidade, assinatura_digital, foto_entrega, observacoes
)
select
  f.id,
  'Centro Regional 1',
  'Rafael Almeida Costa',
  '2024-03-21',
  'Água mineral 1,5L',
  'agua',
  8,
  'assinatura_eliane',
  null,
  'Entrega para família ampliada em situação de abrigo'
from familias_atingidas f
where f.cpf = '84736215005'
limit 1;

insert into public.entregas_familias
(
  familia_id, centro_distribuicao, responsavel_entrega, data_entrega,
  nome_item, categoria_item, quantidade, assinatura_digital, foto_entrega, observacoes
)
select
  f.id,
  'Centro Regional 2',
  'Marcos Vinicius Ribeiro',
  '2024-03-21',
  'Cobertor',
  'cobertores',
  3,
  'assinatura_denise',
  null,
  'Entrega para núcleo desalojado/destruído'
from familias_atingidas f
where f.cpf = '84736215007'
limit 1;

insert into public.entregas_familias
(
  familia_id, centro_distribuicao, responsavel_entrega, data_entrega,
  nome_item, categoria_item, quantidade, assinatura_digital, foto_entrega, observacoes
)
select
  f.id,
  'Abrigo Temporário 1',
  'Juliana Prado Souza',
  '2024-03-22',
  'Kit de limpeza',
  'limpeza',
  1,
  'assinatura_jessica',
  null,
  'Entrega para família em moradia comprometida'
from familias_atingidas f
where f.cpf = '84736215009'
limit 1;