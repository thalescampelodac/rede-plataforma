import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { validateFamilia } from '@/lib/validations'
import { generateIHU } from '@/lib/ihu' 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() || ''
    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const pageSize = Math.max(1, Math.min(100, Number(searchParams.get('pageSize') || '10')))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('familias_atingidas')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (q) {
      const digits = q.replace(/\D/g, '')
      query = query.or(
        `nome_responsavel.ilike.%${q}%,cpf.ilike.%${digits || q}%,municipio.ilike.%${q}%`
      )
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ message: 'Erro ao consultar famílias.' }, { status: 500 })
    }

    return NextResponse.json({
      items: data ?? [],
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno ao consultar famílias.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { valid, errors, normalized } = validateFamilia(body)

    if (!valid) {
      return NextResponse.json({ message: 'Dados inválidos.', errors }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
	
    const { data: existing } = await supabase
      .from('familias_atingidas')
      .select('id')
      .eq('cpf', normalized.cpf)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { message: 'Já existe uma família cadastrada com esse CPF.', errors: { cpf: 'CPF já cadastrado.' } },
        { status: 409 }
      )
    }
	
	const ihuData = await generateIHU({
	  supabase,
	  estado: normalized.estado,
	  municipio: normalized.municipio,
	})
	
	const payload = {
	  ...normalized,
	  ...ihuData,
	}
	
    const { error } = await supabase.from('familias_atingidas').insert([payload])

    if (error) {
      return NextResponse.json({ message: 'Erro ao salvar família.' }, { status: 500 })
    }

    return NextResponse.json({
		message: 'Família cadastrada com sucesso.',
		ihu: payload.ihu,
	})
	
  } catch {
    return NextResponse.json({ message: 'Erro interno ao salvar família.' }, { status: 500 })
  }
}
