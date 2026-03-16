export type MenuItem = {
  label: string
  href: string
  enabled: boolean
  section: 'funcionais' | 'construcao'
  description: string
}

export const menuItems: MenuItem[] = [
  {
    label: 'Famílias Atingidas',
    href: '/app/familias-atingidas',
    enabled: true,
    section: 'funcionais',
    description: 'Cadastro e consulta de famílias impactadas.',
  },
  {
    label: 'Empresas Afetadas',
    href: '/app/empresas-afetadas',
    enabled: true,
    section: 'funcionais',
    description: 'Registro de empresas afetadas e impactos identificados.',
  },
  {
    label: 'Programas Governamentais',
    href: '/app/programas-governamentais',
    enabled: true,
    section: 'funcionais',
    description: 'Cadastro de programas públicos relacionados ao apoio humanitário.',
  },
  {
    label: 'Benefícios por Família',
    href: '/app/beneficios-por-familia',
    enabled: true,
    section: 'funcionais',
    description: 'Controle de benefícios recebidos por família.',
  },
  {
    label: 'Voluntários Ativos',
    href: '/app/voluntarios-ativos',
    enabled: true,
    section: 'funcionais',
    description: 'Cadastro de voluntários e atuação operacional.',
  },
  {
    label: 'Moradias Afetadas',
    href: '/app/moradias-afetadas',
    enabled: true,
    section: 'funcionais',
    description: 'Levantamento de imóveis e danos identificados.',
  },

  {
    label: 'Doações Recebidas',
    href: '/app/doacoes-recebidas',
    enabled: false,
    section: 'construcao',
    description: 'Controle de entrada de doações e rastreabilidade.',
  },
  {
    label: 'Estoque Humanitário',
    href: '/app/estoque-humanitario',
    enabled: false,
    section: 'construcao',
    description: 'Gestão de estoque e disponibilidade de itens.',
  },
  {
    label: 'Transferência entre Centros',
    href: '/app/transferencia-centros',
    enabled: false,
    section: 'construcao',
    description: 'Movimentação logística entre centros de apoio.',
  },
  {
    label: 'Entregas às Famílias',
    href: '/app/entregas-familias',
    enabled: false,
    section: 'construcao',
    description: 'Registro e monitoramento das entregas realizadas.',
  },
  {
    label: 'Vaquinhas Online',
    href: '/app/vaquinhas-online',
    enabled: false,
    section: 'construcao',
    description: 'Acompanhamento de arrecadações e campanhas digitais.',
  },
  {
    label: 'Impacto Geral',
    href: '/app/impacto-geral',
    enabled: false,
    section: 'construcao',
    description: 'Indicadores consolidados e visão gerencial.',
  },
  {
    label: 'Transparência Pública',
    href: '/app/transparencia-publica',
    enabled: false,
    section: 'construcao',
    description: 'Publicação transparente de dados consolidados.',
  },
  {
    label: 'Auditoria',
    href: '/app/auditoria',
    enabled: false,
    section: 'construcao',
    description: 'Rastreabilidade e histórico de operações.',
  },
]
