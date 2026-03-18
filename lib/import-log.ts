export type ImportLogRow = {
  linha_excel: number
  status: 'IMPORTADO' | 'ERRO'
  campo_erro?: string
  valor_recebido?: string
  motivo_erro?: string
  acao_sugerida?: string
}

export function buildImportLogText(params: {
  motivo: string
  modulo: string
  aba: string
  totalLidas: number
  totalImportadas: number
  totalErros: number
  rows: ImportLogRow[]
}) {
  const lines: string[] = []

  lines.push('RESUMO DA IMPORTAÇÃO')
  lines.push(`Motivo: ${params.motivo}`)
  lines.push(`Módulo: ${params.modulo}`)
  lines.push(`Aba lida: ${params.aba}`)
  lines.push('')
  lines.push(`Total de linhas lidas: ${params.totalLidas}`)
  lines.push(`Total importadas: ${params.totalImportadas}`)
  lines.push(`Total com erro: ${params.totalErros}`)
  lines.push('')
  lines.push('DETALHAMENTO POR LINHA')
  lines.push('')

  for (const row of params.rows) {
    lines.push(`Linha ${row.linha_excel} | STATUS: ${row.status}`)

    if (row.status === 'IMPORTADO') {
      lines.push('- Registro importado com sucesso.')
    } else {
      lines.push(`- Campo: ${row.campo_erro || '-'}`)
      lines.push(`- Valor recebido: ${row.valor_recebido ?? ''}`)
      lines.push(`- Motivo: ${row.motivo_erro || 'Erro não identificado.'}`)
      lines.push(`- Ação sugerida: ${row.acao_sugerida || 'Revisar registro e reenviar.'}`)
    }

    lines.push('')
  }

  return lines.join('\n')
}
