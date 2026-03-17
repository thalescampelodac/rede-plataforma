import { NextResponse } from 'next/server'
import { buildImportLogText, ImportLogRow } from '@/lib/import-log'
import { parseExcelFile } from '@/lib/excel'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateFamilia } from '@/lib/validations'

function buildValidationDetail(errors: Record<string, string>, row: Record<string, any>) {
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: 'Arquivo não enviado.' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()

    const { rows, sheetName } = parseExcelFile(buffer, 'familias_atingidas', [
      'ihu',
      'nome_responsavel',
      'cpf',
      'telefone',
      'cep',
      'logradouro',
      'numero',
      'complemento',
      'bairro',
      'estado',
      'municipio',
      'total_moradores',
      'criancas',
      'adolescentes',
      'adultos',
      'idosos',
      'pcd',
      'gestantes',
      'bebes',
      'situacao_moradia',
      'renda_familiar_estimada',
      'ocupacao_responsavel',
      'perda_renda',
      'necessidades_prioritarias',
    ])

    const supabase = getSupabaseAdmin()
    const validRows: any[] = []
    const logRows: ImportLogRow[] = []

    if (!rows.length) {
      const txt = buildImportLogText({
        modulo: 'Famílias Atingidas',
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
          'Content-Disposition': 'attachment; filename="resultado_importacao_familias.txt"',
          'X-Import-Imported': '0',
          'X-Import-Failed': '1',
        },
      })
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]

      const parsed = validateFamilia({
        ihu: row.ihu || '',
        nome_responsavel: row.nome_responsavel || '',
        cpf: row.cpf || '',
        telefone: row.telefone || '',
        cep: row.cep || '',
        logradouro: row.logradouro || '',
        numero: row.numero || '',
        complemento: row.complemento || '',
        bairro: row.bairro || '',
        estado: row.estado || '',
        municipio: row.municipio || '',
        total_moradores: row.total_moradores || 0,
        criancas: row.criancas || 0,
        adolescentes: row.adolescentes || 0,
        adultos: row.adultos || 0,
        idosos: row.idosos || 0,
        pcd: row.pcd || 0,
        gestantes: row.gestantes || 0,
        bebes: row.bebes || 0,
        situacao_moradia: row.situacao_moradia || '',
        renda_familiar_estimada: row.renda_familiar_estimada || '',
        ocupacao_responsavel: row.ocupacao_responsavel || '',
        perda_renda: row.perda_renda || false,
        necessidades_prioritarias: String(row.necessidades_prioritarias || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
      })

      if (!parsed.valid) {
        const detail = buildValidationDetail(parsed.errors, row)

        logRows.push({
          linha_excel: i + 2,
          status: 'ERRO',
          ...detail,
        })
        continue
      }

      const cpf = parsed.normalized.cpf

      const { data: existing } = await supabase
        .from('familias_atingidas')
        .select('id')
        .eq('cpf', cpf)
        .maybeSingle()

      if (existing) {
        logRows.push({
          linha_excel: i + 2,
          status: 'ERRO',
          campo_erro: 'cpf',
          valor_recebido: String(row.cpf || ''),
          motivo_erro: 'CPF já cadastrado no sistema.',
          acao_sugerida: 'Informar CPF diferente ou atualizar o cadastro existente.',
        })
        continue
      }

      validRows.push(parsed.normalized)

      logRows.push({
        linha_excel: i + 2,
        status: 'IMPORTADO',
      })
    }

    let imported = 0

    if (validRows.length > 0) {
      const { error } = await supabase.from('familias_atingidas').insert(validRows)

      if (error) {
        const txt = buildImportLogText({
          modulo: 'Famílias Atingidas',
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
              motivo_erro: 'Erro ao gravar registros válidos no banco de dados.',
              acao_sugerida: 'Verificar a integridade da base e tentar novamente.',
            },
          ],
        })

        return new NextResponse(txt, {
          status: 500,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'attachment; filename="resultado_importacao_familias.txt"',
            'X-Import-Imported': '0',
            'X-Import-Failed': String(rows.length),
          },
        })
      }

      imported = validRows.length
    }

    const failed = logRows.filter((r) => r.status === 'ERRO').length

    const txt = buildImportLogText({
      modulo: 'Famílias Atingidas',
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
        'Content-Disposition': 'attachment; filename="resultado_importacao_familias.txt"',
        'X-Import-Imported': String(imported),
        'X-Import-Failed': String(failed),
      },
    })
  } catch {
    const txt = buildImportLogText({
      modulo: 'Famílias Atingidas',
      aba: 'familias_atingidas',
      totalLidas: 0,
      totalImportadas: 0,
      totalErros: 1,
      rows: [
        {
          linha_excel: 0,
          status: 'ERRO',
          campo_erro: '',
          valor_recebido: '',
          motivo_erro: 'Erro interno ao importar famílias.',
          acao_sugerida: 'Revisar logs do servidor.',
        },
      ],
    })

    return new NextResponse(txt, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="resultado_importacao_familias.txt"',
        'X-Import-Imported': '0',
        'X-Import-Failed': '1',
      },
    })
  }
}