'use client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Topbar from '@/components/Topbar'
import {
  centrosDistribuicao,
  categoriasItem,
  estados,
  unidadesMedida,
} from '@/lib/brazil'

type Option = {
  value: string
  label: string
}

type Estoque = {
  id?: string
  centro_distribuicao: string
  estado: string
  municipio: string
  categoria_item: string
  nome_item: string
  quantidade_estoque: string | number
  unidade: string
  data_entrada: string
  data_validade: string
  localizacao_estoque: string
  observacoes: string
}

const initialForm: Estoque = {
  centro_distribuicao: '',
  estado: '',
  municipio: '',
  categoria_item: '',
  nome_item: '',
  quantidade_estoque: '',
  unidade: '',
  data_entrada: '',
  data_validade: '',
  localizacao_estoque: '',
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

export default function EstoqueHumanitarioPage() {
  const [form, setForm] = useState<Estoque>(initialForm)
  const [items, setItems] = useState<Estoque[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [municipios, setMunicipios] = useState<Option[]>([])

  async function carregarMunicipios(uf: string) {
    if (!uf) {
      setMunicipios([])
      return
    }

    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
      )
      const data = await response.json()

      setMunicipios(
        data.map((item: any) => ({
          value: item.nome,
          label: item.nome,
        }))
      )
    } catch {
      setMunicipios([])
    }
  }

  useEffect(() => {
    carregarMunicipios(form.estado)
  }, [form.estado])

  async function loadItems(search = query) {
    try {
      const response = await fetch(`/api/estoque-humanitario?q=${encodeURIComponent(search)}`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : { items: [] }

      if (!response.ok) {
        setMessage(data.message || 'Erro ao consultar estoque.')
        setItems([])
        return
      }

      setItems(data.items || [])
    } catch {
      setMessage('Erro ao consultar estoque.')
      setItems([])
    }
  }

  useEffect(() => {
    loadItems('')
  }, [])

  function updateField<K extends keyof Estoque>(field: K, value: Estoque[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage('')

    const url = editingId
      ? `/api/estoque-humanitario/${editingId}`
      : '/api/estoque-humanitario'

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
      const response = await fetch(`/api/estoque-humanitario/${id}`, {
        method: 'DELETE',
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      setMessage(data.message || '')
      await loadItems()
    } catch {
      setMessage('Erro ao remover item de estoque.')
    }
  }

  function handleEdit(item: Estoque) {
    setEditingId(item.id || null)
    setErrors({})
    setMessage('')
    setForm({
      ...initialForm,
      ...item,
      data_validade: item.data_validade || '',
      localizacao_estoque: item.localizacao_estoque || '',
      observacoes: item.observacoes || '',
    })
  }

  return (
    <>
      <Topbar
        title="Estoque Humanitário"
        subtitle="Cadastro, consulta, edição e remoção de itens em estoque."
      />

      {message && (
        <div className={`alert ${Object.keys(errors).length ? 'alert-warning' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">{editingId ? 'Editar item de estoque' : 'Novo item de estoque'}</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
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

          <div className="col-md-2">
            <label className="form-label">Estado</label>
            <Select
              styles={selectStyles}
              options={estados}
              value={estados.find(item => item.value === form.estado) || null}
              onChange={(option: any) =>
                setForm(prev => ({
                  ...prev,
                  estado: option?.value || '',
                  municipio: '',
                }))
              }
              placeholder="Selecione"
              isClearable
            />
            {errors.estado && <div className="text-danger small mt-1">{errors.estado}</div>}
          </div>

          <div className="col-md-3">
            <label className="form-label">Município</label>
            <Select
              styles={selectStyles}
              options={municipios}
              value={form.municipio ? { value: form.municipio, label: form.municipio } : null}
              onChange={(option: any) => updateField('municipio', option?.value || '')}
              placeholder="Selecione"
              isClearable
              isDisabled={!form.estado}
            />
            {errors.municipio && <div className="text-danger small mt-1">{errors.municipio}</div>}
          </div>

          <div className="col-md-3">
            <label className="form-label">Categoria do item</label>
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

          <div className="col-md-4">
            <label className="form-label">Nome do item</label>
            <input
              className={`form-control ${errors.nome_item ? 'is-invalid' : ''}`}
              value={form.nome_item}
              onChange={e => updateField('nome_item', e.target.value)}
            />
            <div className="invalid-feedback">{errors.nome_item}</div>
          </div>

          <div className="col-md-2">
            <label className="form-label">Quantidade em estoque</label>
            <input
              type="number"
              step="0.01"
              className={`form-control ${errors.quantidade_estoque ? 'is-invalid' : ''}`}
              value={form.quantidade_estoque}
              onChange={e => updateField('quantidade_estoque', e.target.value)}
            />
            <div className="invalid-feedback">{errors.quantidade_estoque}</div>
          </div>

          <div className="col-md-2">
            <label className="form-label">Unidade</label>
            <Select
              styles={selectStyles}
              options={unidadesMedida}
              value={unidadesMedida.find(item => item.value === form.unidade) || null}
              onChange={(option: any) => updateField('unidade', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.unidade && <div className="text-danger small mt-1">{errors.unidade}</div>}
          </div>

          <div className="col-md-2">
            <label className="form-label">Data de entrada</label>
            <input
              type="date"
              className={`form-control ${errors.data_entrada ? 'is-invalid' : ''}`}
              value={form.data_entrada}
              onChange={e => updateField('data_entrada', e.target.value)}
            />
            <div className="invalid-feedback">{errors.data_entrada}</div>
          </div>

          <div className="col-md-2">
            <label className="form-label">Data de validade</label>
            <input
              type="date"
              className="form-control"
              value={form.data_validade}
              onChange={e => updateField('data_validade', e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Localização no estoque</label>
            <input
              className="form-control"
              value={form.localizacao_estoque}
              onChange={e => updateField('localizacao_estoque', e.target.value)}
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
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar item'}
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
          <h2 className="h5 mb-0">Itens em estoque</h2>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Buscar por item, categoria, centro ou município"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ minWidth: 300 }}
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
                <th>Centro</th>
                <th>Item</th>
                <th>Categoria</th>
                <th>Qtd.</th>
                <th>Unidade</th>
                <th>Município</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.centro_distribuicao}</td>
                  <td>{item.nome_item}</td>
                  <td>{categoriasItem.find(x => x.value === item.categoria_item)?.label || item.categoria_item}</td>
                  <td>{item.quantidade_estoque}</td>
                  <td>{item.unidade}</td>
                  <td>{item.municipio}/{item.estado}</td>
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
                  <td colSpan={7} className="text-center text-muted py-4">
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