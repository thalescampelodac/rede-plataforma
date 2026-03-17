'use client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Topbar from '@/components/Topbar'
import { estados, plataformasVaquinha } from '@/lib/brazil'
import { maskCurrency } from '@/lib/masks'

type Option = {
  value: string
  label: string
}

type Vaquinha = {
  id?: string
  plataforma_utilizada: string
  link_campanha: string
  responsavel: string
  estado: string
  municipio_beneficiado: string
  valor_arrecadado: string
  valor_distribuido: string
  observacoes: string
}

const initialForm: Vaquinha = {
  plataforma_utilizada: '',
  link_campanha: '',
  responsavel: '',
  estado: '',
  municipio_beneficiado: '',
  valor_arrecadado: '',
  valor_distribuido: '',
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

export default function VaquinhasOnlinePage() {
  const [form, setForm] = useState<Vaquinha>(initialForm)
  const [items, setItems] = useState<Vaquinha[]>([])
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
      const response = await fetch(`/api/vaquinhas-online?q=${encodeURIComponent(search)}`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : { items: [] }

      if (!response.ok) {
        setMessage(data.message || 'Erro ao consultar vaquinhas.')
        setItems([])
        return
      }

      setItems(data.items || [])
    } catch {
      setMessage('Erro ao consultar vaquinhas.')
      setItems([])
    }
  }

  useEffect(() => {
    loadItems('')
  }, [])

  function updateField<K extends keyof Vaquinha>(field: K, value: Vaquinha[K]) {
    let newValue: any = value

    if (field === 'valor_arrecadado' || field === 'valor_distribuido') {
      const digits = String(value).replace(/\D/g, '')
      newValue = digits ? maskCurrency(digits) : ''
    }

    setForm(prev => ({ ...prev, [field]: newValue }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage('')

    const url = editingId ? `/api/vaquinhas-online/${editingId}` : '/api/vaquinhas-online'
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
      const response = await fetch(`/api/vaquinhas-online/${id}`, {
        method: 'DELETE',
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      setMessage(data.message || '')
      await loadItems()
    } catch {
      setMessage('Erro ao remover vaquinha.')
    }
  }

  function handleEdit(item: any) {
    setEditingId(item.id || null)
    setErrors({})
    setMessage('')
    setForm({
      ...initialForm,
      ...item,
      valor_arrecadado: item.valor_arrecadado
        ? Number(item.valor_arrecadado).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        : '',
      valor_distribuido: item.valor_distribuido
        ? Number(item.valor_distribuido).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        : '',
      observacoes: item.observacoes || '',
    })
  }

  return (
    <>
      <Topbar
        title="Vaquinhas Online"
        subtitle="Cadastro, consulta, edição e remoção de campanhas de arrecadação."
      />

      {message && (
        <div className={`alert ${Object.keys(errors).length ? 'alert-warning' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">{editingId ? 'Editar vaquinha' : 'Nova vaquinha'}</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Plataforma utilizada</label>
            <Select
              styles={selectStyles}
              options={plataformasVaquinha}
              value={plataformasVaquinha.find(item => item.value === form.plataforma_utilizada) || null}
              onChange={(option: any) => updateField('plataforma_utilizada', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.plataforma_utilizada && (
              <div className="text-danger small mt-1">{errors.plataforma_utilizada}</div>
            )}
          </div>

          <div className="col-md-8">
            <label className="form-label">Link da campanha</label>
            <input
              className={`form-control ${errors.link_campanha ? 'is-invalid' : ''}`}
              value={form.link_campanha}
              onChange={e => updateField('link_campanha', e.target.value)}
            />
            <div className="invalid-feedback">{errors.link_campanha}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Responsável</label>
            <input
              className={`form-control ${errors.responsavel ? 'is-invalid' : ''}`}
              value={form.responsavel}
              onChange={e => updateField('responsavel', e.target.value)}
            />
            <div className="invalid-feedback">{errors.responsavel}</div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Estado</label>
            <Select
              styles={selectStyles}
              options={estados}
              value={estados.find(item => item.value === form.estado) || null}
              onChange={(option: any) =>
                setForm(prev => ({
                  ...prev,
                  estado: option?.value || '',
                  municipio_beneficiado: '',
                }))
              }
              placeholder="Selecione"
              isClearable
            />
            {errors.estado && <div className="text-danger small mt-1">{errors.estado}</div>}
          </div>

          <div className="col-md-3">
            <label className="form-label">Município beneficiado</label>
            <Select
              styles={selectStyles}
              options={municipios}
              value={
                form.municipio_beneficiado
                  ? { value: form.municipio_beneficiado, label: form.municipio_beneficiado }
                  : null
              }
              onChange={(option: any) => updateField('municipio_beneficiado', option?.value || '')}
              placeholder="Selecione"
              isClearable
              isDisabled={!form.estado}
            />
            {errors.municipio_beneficiado && (
              <div className="text-danger small mt-1">{errors.municipio_beneficiado}</div>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Valor arrecadado</label>
            <input
              className={`form-control ${errors.valor_arrecadado ? 'is-invalid' : ''}`}
              value={form.valor_arrecadado}
              onChange={e => updateField('valor_arrecadado', e.target.value)}
            />
            <div className="invalid-feedback">{errors.valor_arrecadado}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Valor distribuído</label>
            <input
              className={`form-control ${errors.valor_distribuido ? 'is-invalid' : ''}`}
              value={form.valor_distribuido}
              onChange={e => updateField('valor_distribuido', e.target.value)}
            />
            <div className="invalid-feedback">{errors.valor_distribuido}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Saldo estimado</label>
            <input
              className="form-control"
              readOnly
              value={(() => {
                const parse = (v: string) =>
                  Number(
                    v
                      .replace(/\s/g, '')
                      .replace('R$', '')
                      .replace(/\./g, '')
                      .replace(',', '.')
                      .trim()
                  ) || 0
                const saldo = parse(form.valor_arrecadado) - parse(form.valor_distribuido)
                return saldo.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              })()}
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
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar vaquinha'}
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
          <h2 className="h5 mb-0">Vaquinhas cadastradas</h2>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Buscar por plataforma, responsável ou município"
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
                <th>Plataforma</th>
                <th>Responsável</th>
                <th>Município</th>
                <th>Arrecadado</th>
                <th>Distribuído</th>
                <th>Saldo</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => {
                const arrecadado = Number(item.valor_arrecadado || 0)
                const distribuido = Number(item.valor_distribuido || 0)
                const saldo = arrecadado - distribuido

                return (
                  <tr key={item.id}>
                    <td>{item.plataforma_utilizada}</td>
                    <td>{item.responsavel}</td>
                    <td>{item.municipio_beneficiado}/{item.estado}</td>
                    <td>{arrecadado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>{distribuido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>{saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
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
                )
              })}

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