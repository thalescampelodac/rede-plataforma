import { currencyToNumber, onlyDigits } from './masks'

export type FamiliaInput = {
  ihu?: string
  nome_responsavel: string
  cpf: string
  telefone?: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  estado: string
  municipio: string
  total_moradores: number | string
  criancas: number | string
  adolescentes: number | string
  adultos: number | string
  idosos: number | string
  pcd: number | string
  gestantes: number | string
  bebes: number | string
  situacao_moradia: string
  renda_familiar_estimada?: string | number | null
  ocupacao_responsavel?: string
  perda_renda?: boolean
  necessidades_prioritarias?: string[]
}

export function isValidCPF(cpf: string) {
  const clean = onlyDigits(cpf)

  if (clean.length !== 11) return false
  if (/^(\d)\1+$/.test(clean)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number(clean[i]) * (10 - i)
  }

  let firstDigit = (sum * 10) % 11
  if (firstDigit === 10) firstDigit = 0
  if (firstDigit !== Number(clean[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number(clean[i]) * (11 - i)
  }

  let secondDigit = (sum * 10) % 11
  if (secondDigit === 10) secondDigit = 0
  if (secondDigit !== Number(clean[10])) return false

  return true
}

function toInt(value: string | number | undefined) {
  const n = Number(value ?? 0)
  return Number.isNaN(n) ? 0 : n
}

export function validateFamilia(data: FamiliaInput) {
  const errors: Record<string, string> = {}

  if (!data.nome_responsavel?.trim() || data.nome_responsavel.trim().length < 5) {
    errors.nome_responsavel = 'Informe o nome completo do responsável.'
  }

  const cpf = onlyDigits(data.cpf)
  if (!cpf) {
    errors.cpf = 'CPF é obrigatório.'
  } else if (!isValidCPF(cpf)) {
    errors.cpf = 'CPF inválido.'
  }

  const telefone = onlyDigits(data.telefone || '')
  const cep = onlyDigits(data.cep)

  if (!cep || cep.length !== 8) {
    errors.cep = 'CEP inválido.'
  }

  if (!data.logradouro?.trim()) errors.logradouro = 'Logradouro é obrigatório.'
  if (!data.numero?.trim()) errors.numero = 'Número é obrigatório.'
  if (!data.bairro?.trim()) errors.bairro = 'Bairro é obrigatório.'
  if (!data.estado?.trim() || data.estado.trim().length !== 2) errors.estado = 'UF inválida.'
  if (!data.municipio?.trim()) errors.municipio = 'Município é obrigatório.'
  if (!data.situacao_moradia?.trim()) errors.situacao_moradia = 'Selecione a situação da moradia.'

  const total_moradores = toInt(data.total_moradores)
  const criancas = toInt(data.criancas)
  const adolescentes = toInt(data.adolescentes)
  const adultos = toInt(data.adultos)
  const idosos = toInt(data.idosos)
  const pcd = toInt(data.pcd)
  const gestantes = toInt(data.gestantes)
  const bebes = toInt(data.bebes)

  if (total_moradores <= 0) {
    errors.total_moradores = 'Informe o total de moradores.'
  }

  let renda: number | null = null
  if (typeof data.renda_familiar_estimada === 'string' && data.renda_familiar_estimada.trim()) {
    renda = currencyToNumber(data.renda_familiar_estimada)
    if (renda === null) {
      errors.renda_familiar_estimada = 'Valor monetário inválido.'
    }
  } else if (typeof data.renda_familiar_estimada === 'number') {
    renda = data.renda_familiar_estimada
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      ihu: data.ihu?.trim() || null,
      nome_responsavel: data.nome_responsavel.trim(),
      cpf,
      telefone: telefone || null,
      cep,
      logradouro: data.logradouro.trim(),
      numero: data.numero.trim(),
      complemento: data.complemento?.trim() || null,
      bairro: data.bairro.trim(),
      estado: data.estado.trim().toUpperCase(),
      municipio: data.municipio.trim(),
      total_moradores,
      criancas,
      adolescentes,
      adultos,
      idosos,
      pcd,
      gestantes,
      bebes,
      situacao_moradia: data.situacao_moradia,
      renda_familiar_estimada: renda,
      ocupacao_responsavel: data.ocupacao_responsavel?.trim() || null,
      perda_renda: Boolean(data.perda_renda),
      necessidades_prioritarias: data.necessidades_prioritarias || [],
    },
  }
}

export type EmpresaInput = {
  nome_empresa: string
  cnpj: string
  estado: string
  municipio: string
  setor_economico: string
  numero_funcionarios: number | string
  tipo_impacto: string
  prejuizo_estimado?: string | number | null
}

function isValidCNPJ(cnpj: string) {
  const clean = onlyDigits(cnpj)

  if (clean.length !== 14) return false
  if (/^(\d)\1+$/.test(clean)) return false

  let length = clean.length - 2
  let numbers = clean.substring(0, length)
  const digits = clean.substring(length)
  let sum = 0
  let pos = length - 7

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers[length - i]) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== Number(digits[0])) return false

  length += 1
  numbers = clean.substring(0, length)
  sum = 0
  pos = length - 7

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers[length - i]) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return result === Number(digits[1])
}

export function validateEmpresa(data: EmpresaInput) {
  const errors: Record<string, string> = {}

  if (!data.nome_empresa?.trim() || data.nome_empresa.trim().length < 2) {
    errors.nome_empresa = 'Informe o nome da empresa.'
  }

  const cnpj = onlyDigits(data.cnpj)
  if (!cnpj) {
    errors.cnpj = 'CNPJ é obrigatório.'
  } else if (!isValidCNPJ(cnpj)) {
    errors.cnpj = 'CNPJ inválido.'
  }

  if (!data.estado?.trim() || data.estado.trim().length !== 2) {
    errors.estado = 'UF inválida.'
  }

  if (!data.municipio?.trim()) {
    errors.municipio = 'Município é obrigatório.'
  }

  if (!data.setor_economico?.trim()) {
    errors.setor_economico = 'Selecione o setor econômico.'
  }

  if (!data.tipo_impacto?.trim()) {
    errors.tipo_impacto = 'Selecione o tipo de impacto.'
  }

  const numero_funcionarios = Number(data.numero_funcionarios ?? 0)
  if (Number.isNaN(numero_funcionarios) || numero_funcionarios < 0) {
    errors.numero_funcionarios = 'Número de funcionários inválido.'
  }

  let prejuizo: number | null = null
  if (typeof data.prejuizo_estimado === 'string' && data.prejuizo_estimado.trim()) {
    prejuizo = currencyToNumber(data.prejuizo_estimado)
    if (prejuizo === null) {
      errors.prejuizo_estimado = 'Valor monetário inválido.'
    }
  } else if (typeof data.prejuizo_estimado === 'number') {
    prejuizo = data.prejuizo_estimado
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      nome_empresa: data.nome_empresa.trim(),
      cnpj,
      estado: data.estado.trim().toUpperCase(),
      municipio: data.municipio.trim(),
      setor_economico: data.setor_economico,
      numero_funcionarios,
      tipo_impacto: data.tipo_impacto,
      prejuizo_estimado: prejuizo,
    },
  }
}

export type VoluntarioInput = {
  nome: string
  cpf: string
  telefone?: string
  estado: string
  municipio: string
  centro_atuacao: string
  funcao_desempenhada: string
  horas_trabalhadas: string | number
  data_inicio: string
  data_fim?: string | null
}

export function validateVoluntario(data: VoluntarioInput) {
  const errors: Record<string, string> = {}

  if (!data.nome?.trim() || data.nome.trim().length < 3) {
    errors.nome = 'Informe o nome do voluntário.'
  }

  const cpf = onlyDigits(data.cpf)
  if (!cpf) {
    errors.cpf = 'CPF é obrigatório.'
  } else if (!isValidCPF(cpf)) {
    errors.cpf = 'CPF inválido.'
  }

  const telefone = onlyDigits(data.telefone || '')

  if (!data.estado?.trim() || data.estado.trim().length !== 2) {
    errors.estado = 'UF inválida.'
  }

  if (!data.municipio?.trim()) {
    errors.municipio = 'Município é obrigatório.'
  }

  if (!data.centro_atuacao?.trim()) {
    errors.centro_atuacao = 'Selecione o centro de atuação.'
  }

  if (!data.funcao_desempenhada?.trim()) {
    errors.funcao_desempenhada = 'Selecione a função desempenhada.'
  }

  const horas = Number(data.horas_trabalhadas)
  if (Number.isNaN(horas) || horas < 0) {
    errors.horas_trabalhadas = 'Horas trabalhadas inválidas.'
  }

  if (!data.data_inicio?.trim()) {
    errors.data_inicio = 'Informe a data de início.'
  }

  if (data.data_fim && data.data_inicio && data.data_fim < data.data_inicio) {
    errors.data_fim = 'A data final não pode ser menor que a data inicial.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      nome: data.nome.trim(),
      cpf,
      telefone: telefone || null,
      estado: data.estado.trim().toUpperCase(),
      municipio: data.municipio.trim(),
      centro_atuacao: data.centro_atuacao,
      funcao_desempenhada: data.funcao_desempenhada,
      horas_trabalhadas: horas,
      data_inicio: data.data_inicio,
      data_fim: data.data_fim?.trim() || null,
    },
  }
}

export type MoradiaInput = {
  familia_id?: string | null
  cep?: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  estado: string
  municipio: string
  tipo_dano: string
  risco_estrutural: string
  necessidade_reconstrucao?: boolean
  familias_afetadas: string | number
  latitude?: string | number | null
  longitude?: string | number | null
  observacoes?: string
}

export function validateMoradia(data: MoradiaInput) {
  const errors: Record<string, string> = {}

  const cep = onlyDigits(data.cep || '')

  if (data.cep && cep.length !== 8) {
    errors.cep = 'CEP inválido.'
  }

  if (!data.logradouro?.trim()) {
    errors.logradouro = 'Logradouro é obrigatório.'
  }

  if (!data.numero?.trim()) {
    errors.numero = 'Número é obrigatório.'
  }

  if (!data.bairro?.trim()) {
    errors.bairro = 'Bairro é obrigatório.'
  }

  if (!data.estado?.trim() || data.estado.trim().length !== 2) {
    errors.estado = 'UF inválida.'
  }

  if (!data.municipio?.trim()) {
    errors.municipio = 'Município é obrigatório.'
  }

  if (!data.tipo_dano?.trim()) {
    errors.tipo_dano = 'Selecione o tipo de dano.'
  }

  if (!data.risco_estrutural?.trim()) {
    errors.risco_estrutural = 'Selecione o risco estrutural.'
  }

  const familias_afetadas = Number(data.familias_afetadas ?? 0)
  if (Number.isNaN(familias_afetadas) || familias_afetadas <= 0) {
    errors.familias_afetadas = 'Informe a quantidade de famílias afetadas.'
  }

  let latitude: number | null = null
  let longitude: number | null = null

  if (data.latitude !== '' && data.latitude !== null && data.latitude !== undefined) {
    latitude = Number(data.latitude)
    if (Number.isNaN(latitude)) {
      errors.latitude = 'Latitude inválida.'
    }
  }

  if (data.longitude !== '' && data.longitude !== null && data.longitude !== undefined) {
    longitude = Number(data.longitude)
    if (Number.isNaN(longitude)) {
      errors.longitude = 'Longitude inválida.'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      familia_id: data.familia_id || null,
      cep: cep || null,
      logradouro: data.logradouro.trim(),
      numero: data.numero.trim(),
      complemento: data.complemento?.trim() || null,
      bairro: data.bairro.trim(),
      estado: data.estado.trim().toUpperCase(),
      municipio: data.municipio.trim(),
      tipo_dano: data.tipo_dano,
      risco_estrutural: data.risco_estrutural,
      necessidade_reconstrucao: Boolean(data.necessidade_reconstrucao),
      familias_afetadas,
      latitude,
      longitude,
      observacoes: data.observacoes?.trim() || null,
    },
  }
}

export type ProgramaInput = {
  nome_programa: string
  esfera: string
  orgao_responsavel: string
  estado?: string
  municipio?: string
  numero_familias_atendidas: string | number
  valor_total_distribuido: string | number
}

export function validatePrograma(data: ProgramaInput) {
  const errors: Record<string, string> = {}

  if (!data.nome_programa?.trim() || data.nome_programa.trim().length < 3) {
    errors.nome_programa = 'Informe o nome do programa.'
  }

  if (!data.esfera?.trim()) {
    errors.esfera = 'Selecione a esfera.'
  }

  if (!data.orgao_responsavel?.trim() || data.orgao_responsavel.trim().length < 3) {
    errors.orgao_responsavel = 'Informe o órgão responsável.'
  }

  if (data.estado && data.estado.trim().length !== 2) {
    errors.estado = 'UF inválida.'
  }

  const numero_familias_atendidas = Number(data.numero_familias_atendidas ?? 0)
  if (Number.isNaN(numero_familias_atendidas) || numero_familias_atendidas < 0) {
    errors.numero_familias_atendidas = 'Número de famílias atendidas inválido.'
  }

  let valor_total_distribuido = 0

  if (typeof data.valor_total_distribuido === 'string') {
    const parsed = currencyToNumber(data.valor_total_distribuido)
    if (parsed === null) {
      errors.valor_total_distribuido = 'Valor monetário inválido.'
    } else {
      valor_total_distribuido = parsed
    }
  } else {
    const n = Number(data.valor_total_distribuido ?? 0)
    if (Number.isNaN(n) || n < 0) {
      errors.valor_total_distribuido = 'Valor monetário inválido.'
    } else {
      valor_total_distribuido = n
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      nome_programa: data.nome_programa.trim(),
      esfera: data.esfera,
      orgao_responsavel: data.orgao_responsavel.trim(),
      estado: data.estado?.trim()?.toUpperCase() || null,
      municipio: data.municipio?.trim() || null,
      numero_familias_atendidas,
      valor_total_distribuido,
    },
  }
}

export type BeneficioInput = {
  familia_id: string
  programa_id?: string | null
  tipo_beneficio: string
  valor_quantidade: string | number
  data_concessao: string
  orgao_pagador_distribuidor: string
  observacoes?: string
}

export function validateBeneficio(data: BeneficioInput) {
  const errors: Record<string, string> = {}

  if (!data.familia_id?.trim()) {
    errors.familia_id = 'Selecione a família.'
  }

  if (!data.tipo_beneficio?.trim()) {
    errors.tipo_beneficio = 'Selecione o tipo de benefício.'
  }

  if (!data.data_concessao?.trim()) {
    errors.data_concessao = 'Informe a data de concessão.'
  }

  if (!data.orgao_pagador_distribuidor?.trim() || data.orgao_pagador_distribuidor.trim().length < 3) {
    errors.orgao_pagador_distribuidor = 'Informe o órgão pagador/distribuidor.'
  }

  let valor_quantidade = 0

  if (typeof data.valor_quantidade === 'string') {
    const raw = data.valor_quantidade.trim()
    if (!raw) {
      errors.valor_quantidade = 'Informe o valor ou quantidade.'
    } else {
      const parsed = currencyToNumber(raw)
      if (parsed !== null) {
        valor_quantidade = parsed
      } else {
        const n = Number(raw.replace(',', '.'))
        if (Number.isNaN(n) || n < 0) {
          errors.valor_quantidade = 'Valor ou quantidade inválido.'
        } else {
          valor_quantidade = n
        }
      }
    }
  } else {
    const n = Number(data.valor_quantidade)
    if (Number.isNaN(n) || n < 0) {
      errors.valor_quantidade = 'Valor ou quantidade inválido.'
    } else {
      valor_quantidade = n
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized: {
      familia_id: data.familia_id,
      programa_id: data.programa_id || null,
      tipo_beneficio: data.tipo_beneficio,
      valor_quantidade,
      data_concessao: data.data_concessao,
      orgao_pagador_distribuidor: data.orgao_pagador_distribuidor.trim(),
      observacoes: data.observacoes?.trim() || null,
    },
  }
}