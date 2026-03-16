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
  'Maria Aparecida Souza',
  '52998224725',
  '32999111222',
  '36036000',
  'Rua São Mateus',
  '120',
  '',
  'São Mateus',
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
  'desalojada',
  1200,
  'Doméstica',
  true,
  array['alimentos','agua','higiene']
),
(
  'João Batista Pereira',
  '11144477735',
  '32999888777',
  '36025000',
  'Rua Halfeld',
  '342',
  'Apto 203',
  'Centro',
  'MG',
  'Juiz de Fora',
  3,
  0,
  1,
  2,
  0,
  0,
  0,
  0,
  'danificada',
  2400,
  'Pedreiro',
  true,
  array['limpeza','roupas']
),
(
  'Ana Paula Oliveira',
  '12345678909',
  '31998765432',
  '30130000',
  'Av Afonso Pena',
  '1000',
  '',
  'Centro',
  'MG',
  'Belo Horizonte',
  5,
  2,
  1,
  2,
  0,
  1,
  0,
  1,
  'desabrigada',
  900,
  'Vendedora',
  true,
  array['alimentos','cobertores','medicamentos']
);

insert into public.empresas_afetadas
(
  nome_empresa,
  cnpj,
  estado,
  municipio,
  setor_economico,
  numero_funcionarios,
  tipo_impacto,
  prejuizo_estimado
)
values
(
  'Supermercado Esperança',
  '11222333000181',
  'MG',
  'Juiz de Fora',
  'comercio',
  18,
  'perda_estoque',
  85000
),
(
  'Transportadora Minas Log',
  '22333444000190',
  'MG',
  'Belo Horizonte',
  'transporte',
  42,
  'operacao_interrompida',
  150000
),
(
  'Hotel Serra Azul',
  '33444555000102',
  'RJ',
  'Petrópolis',
  'turismo',
  26,
  'estrutura_danificada',
  230000
),
(
  'Padaria Pão Nosso',
  '44555666000111',
  'MG',
  'Juiz de Fora',
  'comercio',
  8,
  'queda_receita',
  12000
);

insert into public.voluntarios_ativos
(
  nome,
  cpf,
  telefone,
  estado,
  municipio,
  centro_atuacao,
  funcao_desempenhada,
  horas_trabalhadas,
  data_inicio,
  data_fim
)
values
(
  'Carlos Henrique Mendes',
  '98765432100',
  '32999123456',
  'MG',
  'Juiz de Fora',
  'centro_jf_norte',
  'triagem',
  24,
  '2024-03-01',
  null
),
(
  'Fernanda Lopes Martins',
  '74185296300',
  '31999888777',
  'MG',
  'Belo Horizonte',
  'centro_regional_1',
  'cadastro',
  32,
  '2024-03-05',
  null
),
(
  'Rafael Almeida Costa',
  '85274196300',
  '21998765432',
  'RJ',
  'Petrópolis',
  'abrigo_temporario_1',
  'distribuicao',
  18,
  '2024-02-28',
  null
),
(
  'Juliana Prado Souza',
  '96385274100',
  '31991234567',
  'MG',
  'Contagem',
  'centro_regional_2',
  'apoio_logistico',
  41,
  '2024-02-20',
  null
),
(
  'Marcos Vinicius Ribeiro',
  '15975348620',
  '31993456789',
  'MG',
  'Uberlândia',
  'centro_regional_1',
  'atendimento_social',
  27,
  '2024-03-02',
  null
),
(
  'Patricia Gomes Ferreira',
  '25836914700',
  '32992345678',
  'MG',
  'Juiz de Fora',
  'abrigo_temporario_2',
  'cozinha',
  36,
  '2024-02-25',
  null
);

insert into public.moradias_afetadas
(
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
values
(
  '36036000',
  'Rua São Mateus',
  '120',
  '',
  'São Mateus',
  'MG',
  'Juiz de Fora',
  'alagamento',
  'medio',
  false,
  2,
  -21.7624230,
  -43.3484190,
  'Imóvel com danos no piso e perda parcial de móveis.'
),
(
  '36025000',
  'Rua Halfeld',
  '342',
  'Apto 203',
  'Centro',
  'MG',
  'Juiz de Fora',
  'deslizamento',
  'alto',
  true,
  1,
  -21.7595030,
  -43.3499330,
  'Estrutura comprometida após escorregamento de encosta.'
),
(
  '30130000',
  'Avenida Afonso Pena',
  '1000',
  '',
  'Centro',
  'MG',
  'Belo Horizonte',
  'alagamento',
  'baixo',
  false,
  3,
  -19.9190810,
  -43.9386480,
  'Danos leves e necessidade de limpeza geral.'
),
(
  '25685000',
  'Rua do Imperador',
  '88',
  '',
  'Centro',
  'RJ',
  'Petrópolis',
  'desabamento_parcial',
  'alto',
  true,
  4,
  -22.5098740,
  -43.1777410,
  'Moradia com perda parcial da cobertura e interdição recomendada.'
),
(
  '38010000',
  'Rua Tristão de Castro',
  '55',
  '',
  'Centro',
  'MG',
  'Uberaba',
  'rachaduras_estruturais',
  'medio',
  true,
  1,
  -19.7479130,
  -47.9381180,
  'Rachaduras extensas em paredes e fundação.'
);

insert into public.programas_governamentais
(
  nome_programa,
  esfera,
  orgao_responsavel,
  estado,
  municipio,
  numero_familias_atendidas,
  valor_total_distribuido
)
values
(
  'Auxílio Reconstrução',
  'federal',
  'Ministério da Integração e do Desenvolvimento Regional',
  'MG',
  'Juiz de Fora',
  320,
  480000
),
(
  'Cartão Recomeço',
  'estadual',
  'Secretaria de Desenvolvimento Social de Minas Gerais',
  'MG',
  'Belo Horizonte',
  180,
  225000
),
(
  'Apoio Humanitário Emergencial',
  'municipal',
  'Prefeitura de Juiz de Fora',
  'MG',
  'Juiz de Fora',
  96,
  78500
),
(
  'Programa de Recuperação Local',
  'estadual',
  'Governo do Estado do Rio de Janeiro',
  'RJ',
  'Petrópolis',
  210,
  350000
);

insert into public.beneficios_por_familia
(
  familia_id,
  programa_id,
  tipo_beneficio,
  valor_quantidade,
  data_concessao,
  orgao_pagador_distribuidor,
  observacoes
)
select
  f.id,
  p.id,
  'auxilio_financeiro',
  1200,
  '2024-03-10',
  'Prefeitura de Juiz de Fora',
  'Benefício emergencial inicial'
from familias_atingidas f
left join programas_governamentais p on p.nome_programa = 'Apoio Humanitário Emergencial'
where f.cpf = '52998224725'
limit 1;

insert into public.beneficios_por_familia
(
  familia_id,
  programa_id,
  tipo_beneficio,
  valor_quantidade,
  data_concessao,
  orgao_pagador_distribuidor,
  observacoes
)
select
  f.id,
  p.id,
  'cesta_basica',
  2,
  '2024-03-12',
  'Secretaria de Desenvolvimento Social de Minas Gerais',
  'Entrega de duas cestas básicas'
from familias_atingidas f
left join programas_governamentais p on p.nome_programa = 'Cartão Recomeço'
where f.cpf = '11144477735'
limit 1;

insert into public.beneficios_por_familia
(
  familia_id,
  programa_id,
  tipo_beneficio,
  valor_quantidade,
  data_concessao,
  orgao_pagador_distribuidor,
  observacoes
)
select
  f.id,
  p.id,
  'kit_higiene',
  1,
  '2024-03-15',
  'Ministério da Integração e do Desenvolvimento Regional',
  'Kit entregue no abrigo temporário'
from familias_atingidas f
left join programas_governamentais p on p.nome_programa = 'Auxílio Reconstrução'
where f.cpf = '12345678909'
limit 1;