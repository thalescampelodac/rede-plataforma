import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const [
      familias,
      empresas,
      voluntarios,
      moradias,
      programas,
      beneficios,
      doacoes,
      estoque,
      entregas,
      transferencias,
    ] = await Promise.all([
      supabase.from('familias_atingidas').select('*', { count: 'exact', head: true }),
      supabase.from('empresas_afetadas').select('*', { count: 'exact', head: true }),
      supabase.from('voluntarios_ativos').select('*', { count: 'exact', head: true }),
      supabase.from('moradias_afetadas').select('familias_afetadas'),
      supabase.from('programas_governamentais').select('valor_total_distribuido'),
      supabase.from('beneficios_por_familia').select('valor_quantidade'),
      supabase.from('doacoes_recebidas').select('quantidade'),
      supabase.from('estoque_humanitario').select('quantidade_estoque'),
      supabase.from('entregas_familias').select('quantidade'),
      supabase.from('transferencias_centros').select('quantidade'),
    ])

    const totalFamiliasAfetadasMoradias =
      (moradias.data || []).reduce((acc, item) => acc + Number(item.familias_afetadas || 0), 0)

    const totalProgramas = programas.data?.length || 0
    const totalBeneficios = beneficios.data?.length || 0
    const totalDoacoes = doacoes.data?.length || 0
    const totalEstoque = estoque.data?.length || 0
    const totalEntregas = entregas.data?.length || 0
    const totalTransferencias = transferencias.data?.length || 0

    const somaValorProgramas =
      (programas.data || []).reduce(
        (acc, item) => acc + Number(item.valor_total_distribuido || 0),
        0
      )

    const somaValorBeneficios =
      (beneficios.data || []).reduce(
        (acc, item) => acc + Number(item.valor_quantidade || 0),
        0
      )

    const somaQuantidadeDoacoes =
      (doacoes.data || []).reduce((acc, item) => acc + Number(item.quantidade || 0), 0)

    const somaQuantidadeEstoque =
      (estoque.data || []).reduce(
        (acc, item) => acc + Number(item.quantidade_estoque || 0),
        0
      )

    const somaQuantidadeEntregas =
      (entregas.data || []).reduce((acc, item) => acc + Number(item.quantidade || 0), 0)

    const somaQuantidadeTransferencias =
      (transferencias.data || []).reduce((acc, item) => acc + Number(item.quantidade || 0), 0)

    return NextResponse.json({
      indicadores: {
        familias_atingidas: familias.count || 0,
        empresas_afetadas: empresas.count || 0,
        voluntarios_ativos: voluntarios.count || 0,
        moradias_afetadas: moradias.data?.length || 0,
        programas_governamentais: totalProgramas,
        beneficios_concedidos: totalBeneficios,
        doacoes_recebidas: totalDoacoes,
        itens_estoque: totalEstoque,
        entregas_realizadas: totalEntregas,
        transferencias_centros: totalTransferencias,
        familias_em_moradias: totalFamiliasAfetadasMoradias,
        valor_programas: somaValorProgramas,
        valor_beneficios: somaValorBeneficios,
        quantidade_doacoes: somaQuantidadeDoacoes,
        quantidade_estoque: somaQuantidadeEstoque,
        quantidade_entregas: somaQuantidadeEntregas,
        quantidade_transferencias: somaQuantidadeTransferencias,
      },
    })
  } catch {
    return NextResponse.json(
      { message: 'Erro interno ao consolidar indicadores.' },
      { status: 500 }
    )
  }
}