'use client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Topbar from '@/components/Topbar'
import { esferasPrograma, estados } from '@/lib/brazil'
import { maskCurrency } from '@/lib/masks'

type Option = {
  value: string
  label: string
}

type Programa = {
  id?: string
  nome_programa: string
  esfera: string
  orgao_responsavel: string
  estado: string
  municipio: string
  numero_familias_atendidas: string | number
  valor_total_distribuido: string
}

const initialForm: Programa = {
  nome_programa: '',
  esfera: '',
  orgao_responsavel: '',
  estado: '',
  municipio: '',
  numero_familias_atendidas: '',
  valor_total_distribuido: '',
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: 38,
    borderColor: '#dee2e6',
    boxShadow: 'none',
  }),
}

export default function ProgramasGovernamentaisPage() {
  const [form, setForm] = useState<Programa>(initialForm)
  const [items, setItems] = useState<Programa[]>([])
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
      const response = await fetch(`/api/programas-governamentais?q=${encodeURIComponent(search)}`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : { items: [] }

      if (!response.ok) {
        setMessage(data.message || 'Erro ao consultar programas.')
        setItems([])
        return
      }

      setItems(data.items || [])
    } catch {
      setMessage('Erro ao consultar programas.')
      setItems([])
    }
  }

  useEffect(() => {
    loadItems('')
  }, [])

  function updateField<K extends keyof Programa>(field: K, value: Programa[K]) {
    let newValue: any = value

    if (field === 'valor_total_distribuido') {
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

    const url = editingId
      ? `/api/programas-governamentais/${editingId}`
      : '/api/programas-governamentais'

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
      const response = await fetch(`/api/programas-governamentais/${id}`, {
        method: 'DELETE',
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      setMessage(data.message || '')
      await loadItems()
    } catch {
      setMessage('Erro ao remover programa.')
    }
  }

  function handleEdit(item: Programa) {
    setEditingId(item.id || null)
    setErrors({})
    setMessage('')
    setForm({
      ...initialForm,
      ...item,
      valor_total_distribuido: item.valor_total_distribuido
        ? Number(item.valor_total_distribuido).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        : '',
      estado: item.estado || '',
      municipio: item.municipio || '',
    })
  }

  return (
    <>
      <Topbar
        title="Programas Governamentais"
        subtitle="Cadastro, consulta, edição e remoção de programas governamentais."
      />

      {message && (
        <div className={`alert ${Object.keys(errors).length ? 'alert-warning' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">{editingId ? 'Editar programa' : 'Novo programa'}</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nome do programa</label>
            <input
              className={`form-control ${errors.nome_programa ? 'is-invalid' : ''}`}
              value={form.nome_programa}
              onChange={e => updateField('nome_programa', e.target.value)}
            />
            <div className="invalid-feedback">{errors.nome_programa}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Órgão responsável</label>
            <input
              className={`form-control ${errors.orgao_responsavel ? 'is-invalid' : ''}`}
              value={form.orgao_responsavel}
              onChange={e => updateField('orgao_responsavel', e.target.value)}
            />
            <div className="invalid-feedback">{errors.orgao_responsavel}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Esfera</label>
            <Select
              styles={selectStyles}
              options={esferasPrograma}
              value={esferasPrograma.find(item => item.value === form.esfera) || null}
              onChange={(option: any) => updateField('esfera', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.esfera && <div className="text-danger small mt-1">{errors.esfera}</div>}
          </div>

          <div className="col-md-4">
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

          <div className="col-md-4">
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
          </div>

          <div className="col-md-6">
            <label className="form-label">Número de famílias atendidas</label>
            <input
              type="number"
              className={`form-control ${errors.numero_familias_atendidas ? 'is-invalid' : ''}`}
              value={form.numero_familias_atendidas}
              onChange={e => updateField('numero_familias_atendidas', e.target.value)}
            />
            <div className="invalid-feedback">{errors.numero_familias_atendidas}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Valor total distribuído</label>
            <input
              className={`form-control ${errors.valor_total_distribuido ? 'is-invalid' : ''}`}
              value={form.valor_total_distribuido}
              onChange={e => updateField('valor_total_distribuido', e.target.value)}
            />
            <div className="invalid-feedback">{errors.valor_total_distribuido}</div>
          </div>

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar programa'}
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
          <h2 className="h5 mb-0">Programas cadastrados</h2>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Buscar por programa, órgão ou município"
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
                <th>Programa</th>
                <th>Esfera</th>
                <th>Órgão</th>
                <th>Localidade</th>
                <th>Famílias</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.nome_programa}</td>
                  <td>{esferasPrograma.find(x => x.value === item.esfera)?.label || item.esfera}</td>
                  <td>{item.orgao_responsavel}</td>
                  <td>{item.municipio ? `${item.municipio}/${item.estado}` : '-'}</td>
                  <td>{item.numero_familias_atendidas}</td>
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