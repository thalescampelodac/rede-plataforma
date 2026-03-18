type MunicipioIBGEResponse = {
  id: number
  nome: string
}

function onlyDigits(value: string) {
  return String(value || '').replace(/\D/g, '')
}

function pad6(value: number) {
  return String(value).padStart(6, '0')
}

function normalizeText(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export async function getMunicipioIbgeCode(
  uf: string,
  municipio: string
): Promise<string | null> {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
    { cache: 'no-store' }
  )

  if (!response.ok) return null

  const data = (await response.json()) as MunicipioIBGEResponse[]

  const found = data.find(
    item => normalizeText(item.nome) === normalizeText(municipio)
  )

  return found ? String(found.id) : null
}

export async function getLastIHUSequence(params: {
  supabase: any
  estado: string
  municipio: string
  ano?: number
}) {
  const estado = String(params.estado || '').trim().toUpperCase()
  const municipio = String(params.municipio || '').trim()
  const ano = params.ano || new Date().getFullYear()

  const { data, error } = await params.supabase
    .from('familias_atingidas')
    .select('sequencial_ihu')
    .eq('estado', estado)
    .eq('municipio', municipio)
    .eq('ano_referencia', ano)
    .order('sequencial_ihu', { ascending: false })
    .limit(1)

  if (error) {
    throw new Error('Erro ao consultar sequencial do IHU.')
  }

  return Number(data?.[0]?.sequencial_ihu || 0)
}

export async function generateIHU(params: {
  supabase: any
  estado: string
  municipio: string
  ano?: number
  sequencial?: number
}) {
  const estado = String(params.estado || '').trim().toUpperCase()
  const municipio = String(params.municipio || '').trim()
  const ano = params.ano || new Date().getFullYear()

  const municipioIbge = await getMunicipioIbgeCode(estado, municipio)

  if (!municipioIbge) {
    throw new Error('Não foi possível localizar o código IBGE do município.')
  }

  let nextSeq = params.sequencial

  if (nextSeq == null) {
    const lastSeq = await getLastIHUSequence({
      supabase: params.supabase,
      estado,
      municipio,
      ano,
    })

    nextSeq = lastSeq + 1
  }

  const ihu = `IHU${estado}${onlyDigits(municipioIbge)}${ano}${pad6(nextSeq)}`

  return {
    ihu,
    municipio_ibge: onlyDigits(municipioIbge),
    ano_referencia: ano,
    sequencial_ihu: nextSeq,
  }
}