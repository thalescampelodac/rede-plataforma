import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

function situacaoScore(value?: string | null) {
  switch (value) {
    case 'destruida':
      return 5
    case 'desabrigada':
      return 4
    case 'desalojada':
      return 3
    case 'area_risco':
      return 2
    case 'danificada':
      return 1
    default:
      return 0
  }
}

function tipoDanoScore(value?: string | null) {
  switch (value) {
    case 'desabamento_total':
      return 5
    case 'desabamento_parcial':
      return 4
    case 'deslizamento':
      return 4
    case 'rachaduras_estruturais':
      return 3
    case 'interdicao':
      return 3
    case 'alagamento':
      return 2
    case 'destelhamento':
      return 2
    default:
      return 1
  }
}

function riscoScore(value?: string | null) {
  switch (value) {
    case 'alto':
      return 3
    case 'medio':
      return 2
    case 'baixo':
      return 1
    default:
      return 0
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('moradias_afetadas')
      .select(`
        id,
        logradouro,
        numero,
        bairro,
        municipio,
        estado,
        tipo_dano,
        risco_estrutural,
        familias_afetadas,
        latitude,
        longitude,
        familia_id,
        familias_atingidas (
          id,
          nome_responsavel,
          total_moradores,
          situacao_moradia
        )
      `)

    if (error) {
      return NextResponse.json(
        { message: 'Erro ao consultar moradias para o mapa de calor.' },
        { status: 500 }
      )
    }

    type PontoMapaCalor = {
	  id: string
	  latitude: number
	  longitude: number
	  score: number
	  endereco: string
	  bairro: string
	  municipio: string
	  estado: string
	  tipo_dano: string
	  risco_estrutural: string
	  familias_afetadas: number
	  familia_nome: string | null
	  total_moradores: number
	  situacao_moradia: string | null
	}

	const pontosBrutos = (data || []).map((item: any): PontoMapaCalor | null => {
	  const lat = Number(item.latitude)
	  const lng = Number(item.longitude)

	  if (Number.isNaN(lat) || Number.isNaN(lng)) return null

	  const familia = Array.isArray(item.familias_atingidas)
		? item.familias_atingidas[0]
		: item.familias_atingidas

	  const familiasAfetadas = Number(item.familias_afetadas || 0)
	  const totalMoradores = Number(familia?.total_moradores || 0)

	  const score =
		1 +
		familiasAfetadas +
		totalMoradores +
		situacaoScore(familia?.situacao_moradia) +
		tipoDanoScore(item.tipo_dano) +
		riscoScore(item.risco_estrutural)

	  return {
		id: item.id,
		latitude: lat,
		longitude: lng,
		score,
		endereco: `${item.logradouro}, ${item.numero}`,
		bairro: item.bairro,
		municipio: item.municipio,
		estado: item.estado,
		tipo_dano: item.tipo_dano,
		risco_estrutural: item.risco_estrutural,
		familias_afetadas: familiasAfetadas,
		familia_nome: familia?.nome_responsavel || null,
		total_moradores: totalMoradores,
		situacao_moradia: familia?.situacao_moradia || null,
	  }
	})

	const pontos: PontoMapaCalor[] = pontosBrutos
	  .filter((p): p is PontoMapaCalor => p !== null)
	  .sort((a, b) => b.score - a.score)

	const maxScore = pontos.length > 0 ? pontos[0]!.score : 1

    const heatPoints = pontos.map((p: any) => [
      p.latitude,
      p.longitude,
      Number((p.score / maxScore).toFixed(4)),
    ])

    return NextResponse.json({
      ranking_formula:
        'score = 1 + familias_afetadas + total_moradores + bonus_situacao + bonus_tipo_dano + bonus_risco',
      pontos,
      heatPoints,
      maxScore,
    })
  } catch {
    return NextResponse.json(
      { message: 'Erro interno ao montar mapa de calor.' },
      { status: 500 }
    )
  }
}