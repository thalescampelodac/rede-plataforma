import { NextResponse } from 'next/server'
import { parseExcelFile } from '@/lib/excel'
import { buildImportLogText, ImportLogRow } from '@/lib/import-log'
import { getSupabaseAdmin } from '@/lib/supabase'

type ParsedMoradia = {
  familia_cpf: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  estado: string
  municipio: string
  tipo_dano: string
  risco_estrutural: string
  necessidade_reconstrucao: boolean
  familias_afetadas: number
  latitude: number | null
  longitude: number | null
  observacoes: string
}

function onlyDigits(value: unknown) {
  return String(value || '').replace(/\D/g, '')
}

function normalizeText(value: unknown) {
  return String(value || '').trim()
}

function normalizeUpper(value: unknown) {
  return String(value || '').trim().toUpperCase()
}

function parseBoolean(value: unknown): boolean {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  return ['true', '1', 'sim', 's', 'yes'].includes(normalized)
}

function parseNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null

  const normalized = String(value).replace(',', '.').trim()
  if (!normalized) return null

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function parseInteger(value: unknown, fallback = 0) {
  const parsed = Number(String(value ?? '').trim())
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback
}

function buildValidationDetail(
  errors: Record<string, string>,
  row: Record<string, any>
) {
  const entries = Object.entries(errors)

  if (!entries.length) {
    return {
      campo_erro: '',
      valor_recebido: '',
      motivo_erro: 'Erro de validação não identificado.',
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

function validateMoradia(row: Record<string, any>) {
  const errors: Record<string, string> = {}

  const normalized: ParsedMoradia = {
    familia_cpf: onlyDigits(row.familia_cpf),
    cep: onlyDigits(row.cep),
    logradouro: normalizeText(row.logradouro),
    numero: normalizeText(row.numero),
    complemento: normalizeText(row.complemento),
    bairro: normalizeText(row.bairro),
    estado: normalizeUpper(row.estado),
    municipio: normalizeText(row.municipio),
    tipo_dano: normalizeText(row.tipo_dano),
    risco_estrutural: normalizeText(row.risco_estrutural),
    necessidade_reconstrucao: parseBoolean(row.necessidade_reconstrucao),
    familias_afetadas: parseInteger(row.familias_afetadas, 1),
    latitude: parseNullableNumber(row.latitude),
    longitude: parseNullableNumber(row.longitude),
    observacoes: normalizeText(row.observacoes),
  }

  if (!normalized.logradouro) errors.logradouro = 'Logradouro é obrigatório.'
  if (!normalized.numero) errors.numero = 'Número é obrigatório.'
  if (!normalized.bairro) errors.bairro = 'Bairro é obrigatório.'
  if (!normalized.estado) errors.estado = 'Estado é obrigatório.'
  if (!normalized.municipio) errors.municipio = 'Município é obrigatório.'
  if (!normalized.tipo_dano) errors.tipo_dano = 'Tipo de dano é obrigatório.'
  if (!normalized.risco_estrutural) errors.risco_estrutural = 'Risco estrutural é obrigatório.'

  if (normalized.cep && normalized.cep.length !== 8) {
    errors.cep = 'CEP deve conter 8 dígitos.'
  }

  if (normalized.familia_cpf && normalized.familia_cpf.length !== 11) {
    errors.familia_cpf = 'CPF da família deve conter 11 dígitos.'
  }

  if (normalized.familias_afetadas < 1) {
    errors.familias_afetadas = 'Famílias afetadas deve ser maior ou igual a 1.'
  }

  if (row.latitude !== '' && row.latitude !== null && row.latitude !== undefined && normalized.latitude === null) {
    errors.latitude = 'Latitude inválida.'
  }

  if (row.longitude !== '' && row.longitude !== null && row.longitude !== undefined && normalized.longitude === null) {
    errors.longitude = 'Longitude inválida.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    normalized,
  }
}

function buildDuplicateKey(data: ParsedMoradia, familiaId: string | null) {
  return [
    familiaId || '',
    data.cep || '',
    data.logradouro.toLowerCase(),
    data.numero.toLowerCase(),
    data.bairro.toLowerCase(),
    data.estado,
    data.municipio.toLowerCase(),
  ].join('::')
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: 'Arquivo não enviado.' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()

    const { rows, sheetName } = parseExcelFile(buffer, 'moradias_afetadas', [
      'familia_cpf',
      'cep',
      'logradouro',
      'numero',
      'complemento',
      'bairro',
      'estado',
      'municipio',
      'tipo_dano',
      'risco_estrutural',
      'necessidade_reconstrucao',
      'familias_afetadas',
      'latitude',
      'longitude',
      'observacoes',
    ])

    const supabase = getSupabaseAdmin()
    const validRows: any[] = []
    const logRows: ImportLogRow[] = []
    const duplicateKeys = new Set<string>()

    if (!rows.length) {
      const txt = buildImportLogText({
        motivo: `Nenhuma linha encontrada na aba "${sheetName}".`,
        modulo: 'Moradias Afetadas',
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
            acao_sugerida: 'Verificar se a aba contém cabeçalho e dados.',
          },
        ],
      })

      return new NextResponse(txt, {
        status: 400,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename="resultado_importacao_moradias.txt"',
          'X-Import-Imported': '0',
          'X-Import-Failed': '1',
        },
      })
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const parsed = validateMoradia(row)

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
      let familiaId: string | null = null

      if (normalized.familia_cpf) {
        const { data: familia, error: familiaError } = await supabase
          .from('familias_atingidas')
          .select('id')
          .eq('cpf', normalized.familia_cpf)
          .maybeSingle()

        if (familiaError) {
          logRows.push({
            linha_excel: i + 2,
            status: 'ERRO',
            campo_erro: 'familia_cpf',
            valor_recebido: String(row.familia_cpf ?? ''),
            motivo_erro: 'Erro ao consultar a família vinculada.',
            acao_sugerida: 'Tentar novamente ou revisar a conexão com o banco.',
          })
          continue
        }

        if (!familia) {
          logRows.push({
            linha_excel: i + 2,
            status: 'ERRO',
            campo_erro: 'familia_cpf',
            valor_recebido: String(row.familia_cpf ?? ''),
            motivo_erro: 'CPF informado não corresponde a uma família cadastrada.',
            acao_sugerida: 'Informar um CPF existente ou deixar o campo vazio.',
          })
          continue
        }

        familiaId = familia.id
      }

      const duplicateKey = buildDuplicateKey(normalized, familiaId)

      if (duplicateKeys.has(duplicateKey)) {
        logRows.push({
          linha_excel: i + 2,
          status: 'ERRO',
          campo_erro: 'logradouro',
          valor_recebido: normalized.logradouro,
          motivo_erro: 'Moradia duplicada dentro do próprio arquivo de importação.',
          acao_sugerida: 'Remover a duplicidade no Excel e reenviar o arquivo.',
        })
        continue
      }

      duplicateKeys.add(duplicateKey)

      validRows.push({
        familia_id: familiaId,
        cep: normalized.cep || null,
        logradouro: normalized.logradouro,
        numero: normalized.numero,
        complemento: normalized.complemento || null,
        bairro: normalized.bairro,
        estado: normalized.estado,
        municipio: normalized.municipio,
        tipo_dano: normalized.tipo_dano,
        risco_estrutural: normalized.risco_estrutural,
        necessidade_reconstrucao: normalized.necessidade_reconstrucao,
        familias_afetadas: normalized.familias_afetadas,
        latitude: normalized.latitude,
        longitude: normalized.longitude,
        observacoes: normalized.observacoes || null,
      })

      logRows.push({
        linha_excel: i + 2,
        status: 'IMPORTADO',
      })
    }

    let imported = 0

    if (validRows.length > 0) {
      const { error } = await supabase
        .from('moradias_afetadas')
        .insert(validRows)

      if (error) {
        const txt = buildImportLogText({
          motivo: error.message || 'Erro ao gravar registros válidos no banco de dados.',
          modulo: 'Moradias Afetadas',
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
              motivo_erro: error.message || 'Erro ao gravar registros válidos no banco de dados.',
              acao_sugerida: 'Verificar a integridade da base e tentar novamente.',
            },
          ],
        })

        return new NextResponse(txt, {
          status: 500,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'attachment; filename="resultado_importacao_moradias.txt"',
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
          ? 'Importação concluída com ocorrências.'
          : 'Importação concluída com sucesso.',
      modulo: 'Moradias Afetadas',
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
        'Content-Disposition': 'attachment; filename="resultado_importacao_moradias.txt"',
        'X-Import-Imported': String(imported),
        'X-Import-Failed': String(failed),
      },
    })
  } catch (error: any) {
    const motivo = error?.message || 'Erro interno ao importar moradias.'

    const txt = buildImportLogText({
      motivo,
      modulo: 'Moradias Afetadas',
      aba: 'moradias_afetadas',
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
        'Content-Disposition': 'attachment; filename="resultado_importacao_moradias.txt"',
        'X-Import-Imported': '0',
        'X-Import-Failed': '1',
      },
    })
  }
}