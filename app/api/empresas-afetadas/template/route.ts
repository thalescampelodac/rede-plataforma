import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([
    {
      nome_empresa: 'Mercado Exemplo LTDA',
      cnpj: '12345678000195',
      estado: 'RJ',
      municipio: 'Juiz de Fora',
      setor_economico: 'comercio',
      numero_funcionarios: 12,
      tipo_impacto: 'perda_estoque',
      prejuizo_estimado: '25000,00',
    },
  ])

  XLSX.utils.book_append_sheet(workbook, worksheet, 'empresas_afetadas')

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="rede_import_template_empresas_afetadas.xlsx"',
    },
  })
}
