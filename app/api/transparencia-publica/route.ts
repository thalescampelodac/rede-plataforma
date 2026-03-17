import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const [doacoesRes, entregasRes, vaquinhasRes] = await Promise.all([
      supabase.from('doacoes_recebidas').select('centro_distribuicao, quantidade'),
      supabase.from('entregas_familias').select('familia_id, quantidade'),
      supabase.from('vaquinhas_online').select('valor_arrecadado'),
    ])

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

    if (vaquinhasRes.error) {
      return NextResponse.json(
        { message: 'Erro ao consultar vaquinhas online.' },
        { status: 500 }
      )
    }

    const doacoes = doacoesRes.data || []
    const entregas = entregasRes.data || []
    const vaquinhas = vaquinhasRes.data || []

    // Total de Doações Recebidas
    const totalDoacoesRecebidas = doacoes.reduce((acc, item) => {
      return acc + Number(item.quantidade || 0)
    }, 0)

    // Total Distribuído
    const totalDistribuido = entregas.reduce((acc, item) => {
      return acc + Number(item.quantidade || 0)
    }, 0)

    // Famílias Atendidas (famílias únicas que receberam assistência)
    const familiasAtendidas = new Set(
      entregas.map(item => item.familia_id).filter(Boolean)
    ).size

    // Centros de Distribuição Ativos (centros únicos em doações)
    const centrosDistribuicaoAtivos = new Set(
      doacoes.map(item => item.centro_distribuicao).filter(Boolean)
    ).size

    // Recursos Financeiros Arrecadados (Vaquinhas)
    const recursosVaquinhas = vaquinhas.reduce((acc, item) => {
      return acc + Number(item.valor_arrecadado || 0)
    }, 0)

    return NextResponse.json({
      painel: {
        total_doacoes_recebidas: totalDoacoesRecebidas,
        total_distribuido: totalDistribuido,
        familias_atendidas: familiasAtendidas,
        centros_distribuicao_ativos: centrosDistribuicaoAtivos,
        recursos_financeiros_arrecadados_vaquinhas: recursosVaquinhas,
      },
    })
  } catch {
    return NextResponse.json(
      { message: 'Erro interno ao carregar painel de transparência.' },
      { status: 500 }
    )
  }
}