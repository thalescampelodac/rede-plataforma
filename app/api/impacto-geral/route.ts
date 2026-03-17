import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const [
      familiasRes,
      empresasRes,
      moradiasRes,
      doacoesRes,
      entregasRes,
    ] = await Promise.all([
      supabase.from('familias_atingidas').select('*'),
      supabase.from('empresas_afetadas').select('*', { count: 'exact', head: true }),
      supabase.from('moradias_afetadas').select('*'),
      supabase.from('doacoes_recebidas').select('quantidade'),
      supabase.from('entregas_familias').select('familia_id, quantidade'),
    ])

    if (familiasRes.error) {
      return NextResponse.json(
        { message: 'Erro ao consultar famílias atingidas.' },
        { status: 500 }
      )
    }

    if (empresasRes.error) {
      return NextResponse.json(
        { message: 'Erro ao consultar empresas afetadas.' },
        { status: 500 }
      )
    }

    if (moradiasRes.error) {
      return NextResponse.json(
        { message: 'Erro ao consultar moradias afetadas.' },
        { status: 500 }
      )
    }

    if (doacoesRes.error) {
      return NextResponse.json(
        { message: 'Erro ao consultar doações recebidas.' },
        { status: 500 }
      )
    }

    if (entregasRes.error) {
      return NextResponse.json(
        { message: 'Erro ao consultar entregas às famílias.' },
        { status: 500 }
      )
    }

    const familias = familiasRes.data || []
    const moradias = moradiasRes.data || []
    const doacoes = doacoesRes.data || []
    const entregas = entregasRes.data || []

    // 1) Total de Famílias Atingidas
    const totalFamiliasAtingidas = familias.length

    // 2) Total de Famílias Assistidas
    // Conta famílias únicas que receberam pelo menos uma entrega
    const familiasAssistidasSet = new Set(
      entregas
        .map(item => item.familia_id)
        .filter(Boolean)
    )
    const totalFamiliasAssistidas = familiasAssistidasSet.size

    // 3) Pessoas Desalojadas
    // Soma total_moradores das famílias com situacao_moradia = desalojada
    const pessoasDesalojadas = familias.reduce((acc, item) => {
      if (item.situacao_moradia === 'desalojada') {
        return acc + Number(item.total_moradores || 0)
      }
      return acc
    }, 0)

    // 4) Pessoas Desabrigadas
    // Soma total_moradores das famílias com situacao_moradia = desabrigada
    const pessoasDesabrigadas = familias.reduce((acc, item) => {
      if (item.situacao_moradia === 'desabrigada') {
        return acc + Number(item.total_moradores || 0)
      }
      return acc
    }, 0)

    // 5) Empresas Afetadas
    const empresasAfetadas = empresasRes.count || 0

    // 6) Moradias Destruídas
    // Considera moradias com tipo_dano = desabamento_total
    const moradiasDestruidas = moradias.filter(
      item => item.tipo_dano === 'desabamento_total'
    ).length

    // 7) Volume Total de Doações Recebidas
    // Soma da quantidade registrada em doações_recebidas
    const volumeTotalDoacoesRecebidas = doacoes.reduce((acc, item) => {
      return acc + Number(item.quantidade || 0)
    }, 0)

    // 8) Volume Total Distribuído
    // Soma da quantidade registrada em entregas_familias
    const volumeTotalDistribuido = entregas.reduce((acc, item) => {
      return acc + Number(item.quantidade || 0)
    }, 0)

    return NextResponse.json({
      indicadores: {
        total_familias_atingidas: totalFamiliasAtingidas,
        total_familias_assistidas: totalFamiliasAssistidas,
        pessoas_desalojadas: pessoasDesalojadas,
        pessoas_desabrigadas: pessoasDesabrigadas,
        empresas_afetadas: empresasAfetadas,
        moradias_destruidas: moradiasDestruidas,
        volume_total_doacoes_recebidas: volumeTotalDoacoesRecebidas,
        volume_total_distribuido: volumeTotalDistribuido,
      },
    })
  } catch {
    return NextResponse.json(
      { message: 'Erro interno ao consolidar indicadores.' },
      { status: 500 }
    )
  }
}