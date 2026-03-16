'use client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Topbar from '@/components/Topbar'
import { categoriasItem, centrosDistribuicao } from '@/lib/brazil'
import { maskCPF } from '@/lib/masks'

type LookupOption = {
  value: string
  label: string
}

type Entrega = {
  id?: string
  familia_id: string
  centro_distribuicao: string
  responsavel_entrega: string
  data_entrega: string
  nome_item: string
  categoria_item: string
  quantidade: string | number
  assinatura_digital: string
  foto_entrega: string
  observacoes: string
  familias_atingidas?: {
    id: string
    nome_responsavel: string
    cpf: string
    municipio: string
    estado: string
  } | null
}

const initialForm: Entrega = {
  familia_id: '',
  centro_distribuicao: '',
  responsavel_entrega: '',
  data_entrega: '',
  nome_item: '',
  categoria_item: '',
  quantidade: '',
  assinatura_digital: '',
  foto_entrega: '',
  observacoes: '',
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: 38,
    borderColor: '#dee2e6',
    boxShadow: 'none',
  }),
}

export default function EntregasFamiliasPage() {
  const [form, setForm] = useState<Entrega>(initialForm)
  const [items, setItems] = useState<Entrega[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [familiaOptions, setFamiliaOptions] = useState<LookupOption[]>([])

  async function buscarFamilias(input = '') {
    try {
      const response = await fetch(`/api/familias-lookup?q=${encodeURIComponent(input)}`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : { items: [] }

      const options = (data.items || []).map((item: any) => ({
        value: item.id,
        label: `${item.nome_responsavel} • ${maskCPF(item.cpf)} • ${item.municipio}/${item.estado}`,
      }))

      setFamiliaOptions(options)
    } catch {
      setFamiliaOptions([])
    }
  }

  async function loadItems(search = query) {
    try {
      const response = await fetch(`/api/entregas-familias?q=${encodeURIComponent(search)}`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : { items: [] }

      if (!response.ok) {
        setMessage(data.message || 'Erro ao consultar entregas.')
        setItems([])
        return
      }

      setItems(data.items || [])
    } catch {
      setMessage('Erro ao consultar entregas.')
      setItems([])
    }
  }

  useEffect(() => {
    loadItems('')
    buscarFamilias('')
  }, [])

  function updateField<K extends keyof Entrega>(field: K, value: Entrega[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage('')

    const url = editingId
      ? `/api/entregas-familias/${editingId}`
      : '/api/entregas-familias'

    const method = editingId ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      if (!response.ok) {
        setErrors(data.errors || {})
        setMessage(data.message || 'Erro ao salvar.')
        setLoading(false)
        return
      }

      setMessage(data.message || 'Operação realizada com sucesso.')
      setForm(initialForm)
      setEditingId(null)
      await loadItems()
    } catch {
      setMessage('Erro de comunicação com a API.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return
    if (!window.confirm('Deseja realmente remover este cadastro?')) return

    try {
      const response = await fetch(`/api/entregas-familias/${id}`, {
        method: 'DELETE',
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      setMessage(data.message || '')
      await loadItems()
    } catch {
      setMessage('Erro ao remover entrega.')
    }
  }

  function handleEdit(item: Entrega) {
    setEditingId(item.id || null)
    setErrors({})
    setMessage('')
    setForm({
      ...initialForm,
      ...item,
      assinatura_digital: item.assinatura_digital || '',
      foto_entrega: item.foto_entrega || '',
      observacoes: item.observacoes || '',
    })
  }

  return (
    <>
      <Topbar
        title="Entregas às Famílias"
        subtitle="Cadastro, consulta, edição e remoção de entregas realizadas."
      />

      {message && (
        <div className={`alert ${Object.keys(errors).length ? 'alert-warning' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">{editingId ? 'Editar entrega' : 'Nova entrega'}</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Família</label>
            <Select
              styles={selectStyles}
              options={familiaOptions}
              value={familiaOptions.find(item => item.value === form.familia_id) || null}
              onChange={(option: any) => updateField('familia_id', option?.value || '')}
              onInputChange={(value: string) => {
                void buscarFamilias(value)
              }}
              placeholder="Buscar família"
              isClearable
            />
            {errors.familia_id && <div className="text-danger small mt-1">{errors.familia_id}</div>}
          </div>

          <div className="col-md-3">
            <label className="form-label">Centro de distribuição</label>
            <Select
              styles={selectStyles}
              options={centrosDistribuicao}
              value={centrosDistribuicao.find(item => item.value === form.centro_distribuicao) || null}
              onChange={(option: any) => updateField('centro_distribuicao', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.centro_distribuicao && (
              <div className="text-danger small mt-1">{errors.centro_distribuicao}</div>
            )}
          </div>

          <div className="col-md-3">
            <label className="form-label">Data da entrega</label>
            <input
              type="date"
              className={`form-control ${errors.data_entrega ? 'is-invalid' : ''}`}
              value={form.data_entrega}
              onChange={e => updateField('data_entrega', e.target.value)}
            />
            <div className="invalid-feedback">{errors.data_entrega}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Responsável pela entrega</label>
            <input
              className={`form-control ${errors.responsavel_entrega ? 'is-invalid' : ''}`}
              value={form.responsavel_entrega}
              onChange={e => updateField('responsavel_entrega', e.target.value)}
            />
            <div className="invalid-feedback">{errors.responsavel_entrega}</div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Categoria</label>
            <Select
              styles={selectStyles}
              options={categoriasItem}
              value={categoriasItem.find(item => item.value === form.categoria_item) || null}
              onChange={(option: any) => updateField('categoria_item', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.categoria_item && (
              <div className="text-danger small mt-1">{errors.categoria_item}</div>
            )}
          </div>

          <div className="col-md-3">
            <label className="form-label">Item</label>
            <input
              className={`form-control ${errors.nome_item ? 'is-invalid' : ''}`}
              value={form.nome_item}
              onChange={e => updateField('nome_item', e.target.value)}
            />
            <div className="invalid-feedback">{errors.nome_item}</div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Quantidade</label>
            <input
              type="number"
              step="0.01"
              className={`form-control ${errors.quantidade ? 'is-invalid' : ''}`}
              value={form.quantidade}
              onChange={e => updateField('quantidade', e.target.value)}
            />
            <div className="invalid-feedback">{errors.quantidade}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Assinatura digital</label>
            <input
              className="form-control"
              value={form.assinatura_digital}
              onChange={e => updateField('assinatura_digital', e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Foto da entrega (URL)</label>
            <input
              className="form-control"
              value={form.foto_entrega}
              onChange={e => updateField('foto_entrega', e.target.value)}
            />
          </div>

          <div className="col-12">
            <label className="form-label">Observações</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.observacoes}
              onChange={e => updateField('observacoes', e.target.value)}
            />
          </div>

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar entrega'}
            </button>

            {editingId && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setEditingId(null)
                  setForm(initialForm)
                  setErrors({})
                  setMessage('')
                }}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="page-card">
        <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
          <h2 className="h5 mb-0">Entregas cadastradas</h2>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Buscar por item, categoria ou responsável"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ minWidth: 280 }}
            />
            <button className="btn btn-outline-primary" onClick={() => loadItems()}>
              Buscar
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Família</th>
                <th>Centro</th>
                <th>Item</th>
                <th>Qtd.</th>
                <th>Data</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.familias_atingidas?.nome_responsavel || '-'}</td>
                  <td>{item.centro_distribuicao}</td>
                  <td>{item.nome_item}</td>
                  <td>{item.quantidade}</td>
                  <td>{item.data_entrega}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => handleEdit(item)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Nenhum cadastro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}