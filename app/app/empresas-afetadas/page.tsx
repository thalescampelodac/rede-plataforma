'use client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Topbar from '@/components/Topbar'
import { estados, setoresEconomicos, tiposImpactoEmpresa } from '@/lib/brazil'
import { maskCNPJ, maskCurrency } from '@/lib/masks'

type Option = {
  value: string
  label: string
}

type Empresa = {
  id?: string
  nome_empresa: string
  cnpj: string
  estado: string
  municipio: string
  setor_economico: string
  numero_funcionarios: number | string
  tipo_impacto: string
  prejuizo_estimado: string
}

const initialForm: Empresa = {
  nome_empresa: '',
  cnpj: '',
  estado: '',
  municipio: '',
  setor_economico: '',
  numero_funcionarios: '',
  tipo_impacto: '',
  prejuizo_estimado: '',
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: 38,
    borderColor: '#dee2e6',
    boxShadow: 'none',
  }),
}

export default function EmpresasAfetadasPage() {
  const [form, setForm] = useState<Empresa>(initialForm)
  const [items, setItems] = useState<Empresa[]>([])
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
    const response = await fetch(`/api/empresas-afetadas?q=${encodeURIComponent(search)}`)
    const data = await response.json()
    setItems(data.items || [])
  }

  useEffect(() => {
    loadItems('')
  }, [])

  function updateField<K extends keyof Empresa>(field: K, value: Empresa[K]) {
    let newValue: any = value

    if (field === 'cnpj') newValue = maskCNPJ(String(value))
    if (field === 'prejuizo_estimado') {
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
      ? `/api/empresas-afetadas/${editingId}`
      : '/api/empresas-afetadas'

    const method = editingId ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await response.json()

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
    setLoading(false)
  }

  async function handleDelete(id?: string) {
    if (!id) return
    if (!window.confirm('Deseja realmente remover este cadastro?')) return

    const response = await fetch(`/api/empresas-afetadas/${id}`, {
      method: 'DELETE',
    })

    const data = await response.json()
    setMessage(data.message || '')
    await loadItems()
  }

  function handleEdit(item: Empresa) {
    setEditingId(item.id || null)
    setErrors({})
    setMessage('')
    setForm({
      ...initialForm,
      ...item,
      cnpj: maskCNPJ(item.cnpj || ''),
      prejuizo_estimado: item.prejuizo_estimado
        ? Number(item.prejuizo_estimado).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        : '',
    })
  }

  return (
    <>
      <Topbar
        title="Empresas Afetadas"
        subtitle="Cadastro, consulta, edição e remoção de empresas impactadas."
      />

      {message && (
        <div className={`alert ${Object.keys(errors).length ? 'alert-warning' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">{editingId ? 'Editar empresa' : 'Nova empresa'}</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-8">
            <label className="form-label">Nome da empresa</label>
            <input
              className={`form-control ${errors.nome_empresa ? 'is-invalid' : ''}`}
              value={form.nome_empresa}
              onChange={e => updateField('nome_empresa', e.target.value)}
            />
            <div className="invalid-feedback">{errors.nome_empresa}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">CNPJ</label>
            <input
              className={`form-control ${errors.cnpj ? 'is-invalid' : ''}`}
              value={form.cnpj}
              onChange={e => updateField('cnpj', e.target.value)}
            />
            <div className="invalid-feedback">{errors.cnpj}</div>
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
            {errors.municipio && <div className="text-danger small mt-1">{errors.municipio}</div>}
          </div>

          <div className="col-md-4">
            <label className="form-label">Setor econômico</label>
            <Select
              styles={selectStyles}
              options={setoresEconomicos}
              value={setoresEconomicos.find(item => item.value === form.setor_economico) || null}
              onChange={(option: any) => updateField('setor_economico', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.setor_economico && (
              <div className="text-danger small mt-1">{errors.setor_economico}</div>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Número de funcionários</label>
            <input
              type="number"
              className={`form-control ${errors.numero_funcionarios ? 'is-invalid' : ''}`}
              value={form.numero_funcionarios}
              onChange={e => updateField('numero_funcionarios', e.target.value)}
            />
            <div className="invalid-feedback">{errors.numero_funcionarios}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Tipo de impacto</label>
            <Select
              styles={selectStyles}
              options={tiposImpactoEmpresa}
              value={tiposImpactoEmpresa.find(item => item.value === form.tipo_impacto) || null}
              onChange={(option: any) => updateField('tipo_impacto', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.tipo_impacto && (
              <div className="text-danger small mt-1">{errors.tipo_impacto}</div>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Prejuízo estimado</label>
            <input
              className={`form-control ${errors.prejuizo_estimado ? 'is-invalid' : ''}`}
              value={form.prejuizo_estimado}
              onChange={e => updateField('prejuizo_estimado', e.target.value)}
            />
            <div className="invalid-feedback">{errors.prejuizo_estimado}</div>
          </div>

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar empresa'}
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
          <h2 className="h5 mb-0">Empresas cadastradas</h2>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Buscar por nome, CNPJ ou município"
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
                <th>Empresa</th>
                <th>CNPJ</th>
                <th>Município</th>
                <th>Setor</th>
                <th>Impacto</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.nome_empresa}</td>
                  <td>{maskCNPJ(item.cnpj || '')}</td>
                  <td>{item.municipio}/{item.estado}</td>
                  <td>{setoresEconomicos.find(x => x.value === item.setor_economico)?.label || item.setor_economico}</td>
                  <td>{tiposImpactoEmpresa.find(x => x.value === item.tipo_impacto)?.label || item.tipo_impacto}</td>
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