import { NextResponse } from 'next/server'
import { parseExcelFile } from '@/lib/excel'
import { buildImportLogText, ImportLogRow } from '@/lib/import-log'
import { getSupabaseAdmin } from '@/lib/supabase'

type ParsedEmpresa = {
  nome_empresa: string
  cnpj: string
  estado: string
  municipio: string
  setor_economico: string
  numero_funcionarios: number
  tipo_impacto: string
  prejuizo_estimado: number | null
}

function onlyDigits(value: unknown) {
  return String(value || '').replace(/\D/g, '')
}

function normalizeText(value: unknown) {
  return String(value || '').trim()
}

function normalizeUpper(value: unknown) {
  return normalizeText(value).toUpperCase()
}

function parseInteger(value: unknown, fallback = 0) {
  const parsed = Number(String(value ?? '').trim())
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback
}

function parseCurrency(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null

  const raw = String(value).trim()
  if (!raw) return null

  const normalized = raw.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function isValidCNPJ(cnpj: string) {
  if (cnpj.length !== 14) return false
  if (/^(\d)\1+$/.test(cnpj)) return false

  let length = cnpj.length - 2
  let numbers = cnpj.substring(0, length)
  const digits = cnpj.substring(length)
  let sum = 0
  let pos = length - 7

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers[length - i]) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== Number(digits[0])) return false

  length += 1
  numbers = cnpj.substring(0, length)
  sum = 0
  pos = length - 7

  for (let i = length; i >= 1; i--) {
    sum += Number(numbers[length - i]) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return result === Number(digits[1])
}

function buildValidationDetail(errors: Record<string, string>, row: Record<string, any>) {
  const entries = Object.entries(errors)

  if (!entries.length) {
    return {
      campo_erro: '',
      valor_recebido: '',
      motivo_erro: 'Erro de validacao nao identificado.',
      acao_sugerida: 'Revisar a linha e reenviar.',
    }
  }

  const [campo, motivo] = entries[0]

  return {
    campo_erro: campo,
    valor_recebido: String(row[campo] ?? ''),
    motivo_erro: motivo,
    acao_sugerida: `Corrigir o campo "${campo}" e reenviar a linha.`,
  }
}

function validateEmpresa(row: Record<string, any>) {
  const errors: Record<string, string> = {}

  const normalized: ParsedEmpresa = {
    nome_empresa: normalizeText(row.nome_empresa),
    cnpj: onlyDigits(row.cnpj),
    estado: normalizeUpper(row.estado),
    municipio: normalizeText(row.municipio),
    setor_economico: normalizeText(row.setor_economico),
    numero_funcionarios: parseInteger(row.numero_funcionarios, 0),
    tipo_impacto: normalizeText(row.tipo_impacto),
    prejuizo_estimado: parseCurrency(row.prejuizo_estimado),
  }

  if (!normalized.nome_empresa || normalized.nome_empresa.length < 2) {
    errors.nome_empresa = 'Informe o nome da empresa.'
  }

  if (!normalized.cnpj) {
    errors.cnpj = 'CNPJ e obrigatorio.'
  } else if (!isValidCNPJ(normalized.cnpj)) {
    errors.cnpj = 'CNPJ invalido.'
  }

  if (!normalized.estado || normalized.estado.length !== 2) {
    errors.estado = 'UF invalida.'
  }

  if (!normalized.municipio) {
    errors.municipio = 'Municipio e obrigatorio.'
  }

  if (!normalized.setor_economico) {
    errors.setor_economico = 'Setor economico e obrigatorio.'
  }

  if (!normalized.tipo_impacto) {
    errors.tipo_impacto = 'Tipo de impacto e obrigatorio.'
  }

  if (normalized.numero_funcionarios < 0) {
    errors.numero_funcionarios = 'Numero de funcionarios invalido.'
  }

  if (
    row.prejuizo_estimado !== '' &&
    row.prejuizo_estimado !== null &&
    row.prejuizo_estimado !== undefined &&
    normalized.prejuizo_estimado === null
  ) {
    errors.prejuizo_estimado = 'Prejuizo estimado invalido.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized,
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: 'Arquivo nao enviado.' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()

    const { rows, sheetName } = parseExcelFile(buffer, 'empresas_afetadas', [
      'nome_empresa',
      'cnpj',
      'estado',
      'municipio',
      'setor_economico',
      'numero_funcionarios',
      'tipo_impacto',
      'prejuizo_estimado',
    ])

    const supabase = getSupabaseAdmin()
    const validRows: ParsedEmpresa[] = []
    const logRows: ImportLogRow[] = []
    const cnpjSet = new Set<string>()

    if (!rows.length) {
      const txt = buildImportLogText({
        motivo: `Nenhuma linha encontrada na aba "${sheetName}".`,
        modulo: 'Empresas Afetadas',
        aba: sheetName,
        totalLidas: 0,
        totalImportadas: 0,
        totalErros: 1,
        rows: [
          {
            linha_excel: 0,
            status: 'ERRO',
            campo_erro: '',
            valor_recebido: '',
            motivo_erro: `Nenhuma linha encontrada na aba "${sheetName}".`,
            acao_sugerida: 'Verificar se a aba contem cabecalho e dados.',
          },
        ],
      })

      return new NextResponse(txt, {
        status: 400,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename="resultado_importacao_empresas.txt"',
          'X-Import-Imported': '0',
          'X-Import-Failed': '1',
        },
      })
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const parsed = validateEmpresa(row)

      if (!parsed.valid) {
        const detail = buildValidationDetail(parsed.errors, row)

        logRows.push({
          linha_excel: i + 2,
          status: 'ERRO',
          ...detail,
        })

        continue
      }

      const normalized = parsed.normalized

      if (cnpjSet.has(normalized.cnpj)) {
        logRows.push({
          linha_excel: i + 2,
          status: 'ERRO',
          campo_erro: 'cnpj',
          valor_recebido: String(row.cnpj ?? ''),
          motivo_erro: 'CNPJ duplicado dentro do proprio arquivo de importacao.',
          acao_sugerida: 'Remover a duplicidade no Excel e reenviar o arquivo.',
        })
        continue
      }

      const { data: existing, error: existingError } = await supabase
        .from('empresas_afetadas')
        .select('id')
        .eq('cnpj', normalized.cnpj)
        .maybeSingle()

      if (existingError) {
        logRows.push({
          linha_excel: i + 2,
          status: 'ERRO',
          campo_erro: 'cnpj',
          valor_recebido: String(row.cnpj ?? ''),
          motivo_erro: 'Erro ao verificar CNPJ existente na base.',
          acao_sugerida: 'Tentar novamente ou revisar a conexao com o banco.',
        })
        continue
      }

      if (existing) {
        logRows.push({
          linha_excel: i + 2,
          status: 'ERRO',
          campo_erro: 'cnpj',
          valor_recebido: String(row.cnpj ?? ''),
          motivo_erro: 'CNPJ ja cadastrado no sistema.',
          acao_sugerida: 'Informar CNPJ diferente ou atualizar o cadastro existente.',
        })
        continue
      }

      cnpjSet.add(normalized.cnpj)
      validRows.push(normalized)
      logRows.push({
        linha_excel: i + 2,
        status: 'IMPORTADO',
      })
    }

    let imported = 0

    if (validRows.length > 0) {
      const { error } = await supabase.from('empresas_afetadas').insert(validRows)

      if (error) {
        const txt = buildImportLogText({
          motivo: error.message || 'Erro ao gravar registros validos no banco de dados.',
          modulo: 'Empresas Afetadas',
          aba: sheetName,
          totalLidas: rows.length,
          totalImportadas: 0,
          totalErros: rows.length,
          rows: [
            {
              linha_excel: 0,
              status: 'ERRO',
              campo_erro: '',
              valor_recebido: '',
              motivo_erro: error.message || 'Erro ao gravar registros validos no banco de dados.',
              acao_sugerida: 'Verificar a integridade da base e tentar novamente.',
            },
          ],
        })

        return new NextResponse(txt, {
          status: 500,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'attachment; filename="resultado_importacao_empresas.txt"',
            'X-Import-Imported': '0',
            'X-Import-Failed': String(rows.length),
          },
        })
      }

      imported = validRows.length
    }

    const failed = logRows.filter(row => row.status === 'ERRO').length

    const txt = buildImportLogText({
      motivo:
        failed > 0
          ? 'Importacao concluida com ocorrencias.'
          : 'Importacao concluida com sucesso.',
      modulo: 'Empresas Afetadas',
      aba: sheetName,
      totalLidas: rows.length,
      totalImportadas: imported,
      totalErros: failed,
      rows: logRows,
    })

    return new NextResponse(txt, {
      status: failed > 0 ? 207 : 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="resultado_importacao_empresas.txt"',
        'X-Import-Imported': String(imported),
        'X-Import-Failed': String(failed),
      },
    })
  } catch (error: any) {
    const motivo = error?.message || 'Erro interno ao importar empresas.'

    const txt = buildImportLogText({
      motivo,
      modulo: 'Empresas Afetadas',
      aba: 'empresas_afetadas',
      totalLidas: 0,
      totalImportadas: 0,
      totalErros: 1,
      rows: [
        {
          linha_excel: 0,
          status: 'ERRO',
          campo_erro: '',
          valor_recebido: '',
          motivo_erro: motivo,
          acao_sugerida: 'Revisar logs do servidor.',
        },
      ],
    })

    return new NextResponse(txt, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="resultado_importacao_empresas.txt"',
        'X-Import-Imported': '0',
        'X-Import-Failed': '1',
      },
    })
  }
}
