'use client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Topbar from '@/components/Topbar'
import { centrosAtuacao, estados, funcoesVoluntario } from '@/lib/brazil'
import { maskCPF, maskPhone } from '@/lib/masks'

type Option = {
  value: string
  label: string
}

type Voluntario = {
  id?: string
  nome: string
  cpf: string
  telefone: string
  estado: string
  municipio: string
  centro_atuacao: string
  funcao_desempenhada: string
  horas_trabalhadas: string | number
  data_inicio: string
  data_fim: string
}

const initialForm: Voluntario = {
  nome: '',
  cpf: '',
  telefone: '',
  estado: '',
  municipio: '',
  centro_atuacao: '',
  funcao_desempenhada: '',
  horas_trabalhadas: '',
  data_inicio: '',
  data_fim: '',
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: 38,
    borderColor: '#dee2e6',
    boxShadow: 'none',
  }),
}

export default function VoluntariosAtivosPage() {
  const [form, setForm] = useState<Voluntario>(initialForm)
  const [items, setItems] = useState<Voluntario[]>([])
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
      const response = await fetch(`/api/voluntarios-ativos?q=${encodeURIComponent(search)}`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : { items: [] }

      if (!response.ok) {
        setMessage(data.message || 'Erro ao consultar voluntários.')
        setItems([])
        return
      }

      setItems(data.items || [])
    } catch {
      setMessage('Erro ao consultar voluntários.')
      setItems([])
    }
  }

  useEffect(() => {
    loadItems('')
  }, [])

  function updateField<K extends keyof Voluntario>(field: K, value: Voluntario[K]) {
    let newValue: any = value

    if (field === 'cpf') newValue = maskCPF(String(value))
    if (field === 'telefone') newValue = maskPhone(String(value))

    setForm(prev => ({ ...prev, [field]: newValue }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage('')

    const url = editingId
      ? `/api/voluntarios-ativos/${editingId}`
      : '/api/voluntarios-ativos'

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
      const response = await fetch(`/api/voluntarios-ativos/${id}`, {
        method: 'DELETE',
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      setMessage(data.message || '')
      await loadItems()
    } catch {
      setMessage('Erro ao remover voluntário.')
    }
  }

  function handleEdit(item: Voluntario) {
    setEditingId(item.id || null)
    setErrors({})
    setMessage('')
    setForm({
      ...initialForm,
      ...item,
      cpf: maskCPF(item.cpf || ''),
      telefone: maskPhone(item.telefone || ''),
      data_fim: item.data_fim || '',
    })
  }

  return (
    <>
      <Topbar
        title="Voluntários Ativos"
        subtitle="Cadastro, consulta, edição e remoção de voluntários."
      />

      {message && (
        <div className={`alert ${Object.keys(errors).length ? 'alert-warning' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">{editingId ? 'Editar voluntário' : 'Novo voluntário'}</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-8">
            <label className="form-label">Nome</label>
            <input
              className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
              value={form.nome}
              onChange={e => updateField('nome', e.target.value)}
            />
            <div className="invalid-feedback">{errors.nome}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">CPF</label>
            <input
              className={`form-control ${errors.cpf ? 'is-invalid' : ''}`}
              value={form.cpf}
              onChange={e => updateField('cpf', e.target.value)}
            />
            <div className="invalid-feedback">{errors.cpf}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Telefone</label>
            <input
              className="form-control"
              value={form.telefone}
              onChange={e => updateField('telefone', e.target.value)}
            />
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

          <div className="col-md-6">
            <label className="form-label">Centro de atuação</label>
            <Select
              styles={selectStyles}
              options={centrosAtuacao}
              value={centrosAtuacao.find(item => item.value === form.centro_atuacao) || null}
              onChange={(option: any) => updateField('centro_atuacao', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.centro_atuacao && (
              <div className="text-danger small mt-1">{errors.centro_atuacao}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Função desempenhada</label>
            <Select
              styles={selectStyles}
              options={funcoesVoluntario}
              value={funcoesVoluntario.find(item => item.value === form.funcao_desempenhada) || null}
              onChange={(option: any) => updateField('funcao_desempenhada', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.funcao_desempenhada && (
              <div className="text-danger small mt-1">{errors.funcao_desempenhada}</div>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Horas trabalhadas</label>
            <input
              type="number"
              step="0.01"
              className={`form-control ${errors.horas_trabalhadas ? 'is-invalid' : ''}`}
              value={form.horas_trabalhadas}
              onChange={e => updateField('horas_trabalhadas', e.target.value)}
            />
            <div className="invalid-feedback">{errors.horas_trabalhadas}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Data de início</label>
            <input
              type="date"
              className={`form-control ${errors.data_inicio ? 'is-invalid' : ''}`}
              value={form.data_inicio}
              onChange={e => updateField('data_inicio', e.target.value)}
            />
            <div className="invalid-feedback">{errors.data_inicio}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Data final</label>
            <input
              type="date"
              className={`form-control ${errors.data_fim ? 'is-invalid' : ''}`}
              value={form.data_fim}
              onChange={e => updateField('data_fim', e.target.value)}
            />
            <div className="invalid-feedback">{errors.data_fim}</div>
          </div>

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar voluntário'}
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
          <h2 className="h5 mb-0">Voluntários cadastrados</h2>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Buscar por nome, CPF ou município"
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
                <th>Nome</th>
                <th>CPF</th>
                <th>Município</th>
                <th>Centro</th>
                <th>Função</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{maskCPF(item.cpf || '')}</td>
                  <td>{item.municipio}/{item.estado}</td>
                  <td>{centrosAtuacao.find(x => x.value === item.centro_atuacao)?.label || item.centro_atuacao}</td>
                  <td>{funcoesVoluntario.find(x => x.value === item.funcao_desempenhada)?.label || item.funcao_desempenhada}</td>
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