'use client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Topbar from '@/components/Topbar'
import { tiposBeneficio } from '@/lib/brazil'
import { maskCPF, maskCurrency } from '@/lib/masks'

type LookupOption = {
  value: string
  label: string
}

type Beneficio = {
  id?: string
  familia_id: string
  programa_id?: string | null
  tipo_beneficio: string
  valor_quantidade: string
  data_concessao: string
  orgao_pagador_distribuidor: string
  observacoes: string
  familias_atingidas?: {
    id: string
    nome_responsavel: string
    cpf: string
    municipio: string
    estado: string
  } | null
  programas_governamentais?: {
    id: string
    nome_programa: string
    esfera: string
  } | null
}

const initialForm: Beneficio = {
  familia_id: '',
  programa_id: null,
  tipo_beneficio: '',
  valor_quantidade: '',
  data_concessao: '',
  orgao_pagador_distribuidor: '',
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

function formatTipoBeneficio(value: string) {
  return tiposBeneficio.find(item => item.value === value)?.label || value
}

export default function BeneficiosPorFamiliaPage() {
  const [form, setForm] = useState<Beneficio>(initialForm)
  const [items, setItems] = useState<Beneficio[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [familiaOptions, setFamiliaOptions] = useState<LookupOption[]>([])
  const [programaOptions, setProgramaOptions] = useState<LookupOption[]>([])

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

  async function buscarProgramas(input = '') {
    try {
      const response = await fetch(`/api/programas-lookup?q=${encodeURIComponent(input)}`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : { items: [] }

      const options = (data.items || []).map((item: any) => ({
        value: item.id,
        label: `${item.nome_programa} • ${item.esfera}${item.municipio ? ` • ${item.municipio}/${item.estado}` : ''}`,
      }))

      setProgramaOptions(options)
    } catch {
      setProgramaOptions([])
    }
  }

  async function loadItems(search = query) {
    try {
      const response = await fetch(`/api/beneficios-por-familia?q=${encodeURIComponent(search)}`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : { items: [] }

      if (!response.ok) {
        setMessage(data.message || 'Erro ao consultar benefícios.')
        setItems([])
        return
      }

      setItems(data.items || [])
    } catch {
      setMessage('Erro ao consultar benefícios.')
      setItems([])
    }
  }

  useEffect(() => {
    loadItems('')
    buscarFamilias('')
    buscarProgramas('')
  }, [])

  function updateField<K extends keyof Beneficio>(field: K, value: Beneficio[K]) {
    let newValue: any = value

    if (field === 'valor_quantidade') {
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
      ? `/api/beneficios-por-familia/${editingId}`
      : '/api/beneficios-por-familia'

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
      const response = await fetch(`/api/beneficios-por-familia/${id}`, {
        method: 'DELETE',
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      setMessage(data.message || '')
      await loadItems()
    } catch {
      setMessage('Erro ao remover benefício.')
    }
  }

  function handleEdit(item: Beneficio) {
    setEditingId(item.id || null)
    setErrors({})
    setMessage('')
    setForm({
      ...initialForm,
      ...item,
      familia_id: item.familia_id,
      programa_id: item.programa_id || null,
      valor_quantidade: item.valor_quantidade
        ? Number(item.valor_quantidade).toLocaleString('pt-BR', {
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
        title="Benefícios por Família"
        subtitle="Cadastro, consulta, edição e remoção de benefícios concedidos."
      />

      {message && (
        <div className={`alert ${Object.keys(errors).length ? 'alert-warning' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">{editingId ? 'Editar benefício' : 'Novo benefício'}</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Família</label>
            <Select
              styles={selectStyles}
              options={familiaOptions}
              value={familiaOptions.find(item => item.value === form.familia_id) || null}
              onChange={(option: any) => updateField('familia_id', option?.value || '')}
              onInputChange={(value: string) => {
							  buscarFamilias(value)
							}}
              placeholder="Buscar família"
              isClearable
            />
            {errors.familia_id && <div className="text-danger small mt-1">{errors.familia_id}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label">Programa/Origem</label>
            <Select
              styles={selectStyles}
              options={programaOptions}
              value={programaOptions.find(item => item.value === form.programa_id) || null}
              onChange={(option: any) => updateField('programa_id', option?.value || null)}
              onInputChange={(value: string) => {
							  buscarProgramas(value)
							}}
              placeholder="Buscar programa"
              isClearable
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Tipo de benefício</label>
            <Select
              styles={selectStyles}
              options={tiposBeneficio}
              value={tiposBeneficio.find(item => item.value === form.tipo_beneficio) || null}
              onChange={(option: any) => updateField('tipo_beneficio', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.tipo_beneficio && (
              <div className="text-danger small mt-1">{errors.tipo_beneficio}</div>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Valor / Quantidade</label>
            <input
              className={`form-control ${errors.valor_quantidade ? 'is-invalid' : ''}`}
              value={form.valor_quantidade}
              onChange={e => updateField('valor_quantidade', e.target.value)}
            />
            <div className="invalid-feedback">{errors.valor_quantidade}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Data de concessão</label>
            <input
              type="date"
              className={`form-control ${errors.data_concessao ? 'is-invalid' : ''}`}
              value={form.data_concessao}
              onChange={e => updateField('data_concessao', e.target.value)}
            />
            <div className="invalid-feedback">{errors.data_concessao}</div>
          </div>

          <div className="col-md-12">
            <label className="form-label">Órgão pagador/distribuidor</label>
            <input
              className={`form-control ${errors.orgao_pagador_distribuidor ? 'is-invalid' : ''}`}
              value={form.orgao_pagador_distribuidor}
              onChange={e => updateField('orgao_pagador_distribuidor', e.target.value)}
            />
            <div className="invalid-feedback">{errors.orgao_pagador_distribuidor}</div>
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
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar benefício'}
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
          <h2 className="h5 mb-0">Benefícios cadastrados</h2>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Buscar por tipo ou órgão"
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
                <th>Programa</th>
                <th>Tipo</th>
                <th>Valor / Quantidade</th>
                <th>Data</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.familias_atingidas?.nome_responsavel || '-'}</td>
                  <td>{item.programas_governamentais?.nome_programa || '-'}</td>
                  <td>{formatTipoBeneficio(item.tipo_beneficio)}</td>
                  <td>
                    {Number(item.valor_quantidade || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td>{item.data_concessao}</td>
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