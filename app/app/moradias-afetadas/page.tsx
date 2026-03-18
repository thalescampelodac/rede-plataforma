'use client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Topbar from '@/components/Topbar'
import { buscarCep } from '@/lib/cep'
import { estados, riscosEstruturais, tiposDanoMoradia } from '@/lib/brazil'
import { maskCEP, maskCPF } from '@/lib/masks'
import dynamic from 'next/dynamic'
import ImportExcelButton from '@/components/ImportExcelButton'
import DownloadTemplateButton from '@/components/DownloadTemplateButton'

const MoradiasMap = dynamic(() => import('@/components/MoradiasMap'), {
  ssr: false,
})

type Option = {
  value: string
  label: string
}

type FamiliaOption = {
  value: string
  label: string
}

type Moradia = {
  id?: string
  familia_id?: string | null
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  estado: string
  municipio: string
  tipo_dano: string
  risco_estrutural: string
  necessidade_reconstrucao: boolean
  familias_afetadas: string | number
  latitude: string | number
  longitude: string | number
  observacoes: string
  familias_atingidas?: {
    id: string
    nome_responsavel: string
    cpf: string
  } | null
}

const initialForm: Moradia = {
  familia_id: null,
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  estado: '',
  municipio: '',
  tipo_dano: '',
  risco_estrutural: '',
  necessidade_reconstrucao: false,
  familias_afetadas: 1,
  latitude: '',
  longitude: '',
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

export default function MoradiasAfetadasPage() {
  const [form, setForm] = useState<Moradia>(initialForm)
  const [items, setItems] = useState<Moradia[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [municipios, setMunicipios] = useState<Option[]>([])
  const [familiaOptions, setFamiliaOptions] = useState<FamiliaOption[]>([])

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

  useEffect(() => {
    carregarMunicipios(form.estado)
  }, [form.estado])

  useEffect(() => {
    buscarFamilias('')
  }, [])

  async function loadItems(search = query) {
    try {
      const response = await fetch(`/api/moradias-afetadas?q=${encodeURIComponent(search)}`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : { items: [] }

      if (!response.ok) {
        setMessage(data.message || 'Erro ao consultar moradias.')
        setItems([])
        return
      }

      setItems(data.items || [])
    } catch {
      setMessage('Erro ao consultar moradias.')
      setItems([])
    }
  }

  useEffect(() => {
    loadItems('')
  }, [])

  function updateField<K extends keyof Moradia>(field: K, value: Moradia[K]) {
    let newValue: any = value

    if (field === 'cep') newValue = maskCEP(String(value))

    setForm(prev => ({ ...prev, [field]: newValue }))
  }

  async function handleCepBlur() {
    const data = await buscarCep(form.cep)

    if (!data) return

    setForm(prev => ({
      ...prev,
      logradouro: data.logradouro || prev.logradouro,
      complemento: data.complemento || prev.complemento,
      bairro: data.bairro || prev.bairro,
      estado: data.uf || prev.estado,
      municipio: data.localidade || prev.municipio,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage('')

    const url = editingId
      ? `/api/moradias-afetadas/${editingId}`
      : '/api/moradias-afetadas'

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
      const response = await fetch(`/api/moradias-afetadas/${id}`, {
        method: 'DELETE',
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      setMessage(data.message || '')
      await loadItems()
    } catch {
      setMessage('Erro ao remover moradia.')
    }
  }

  function handleEdit(item: Moradia) {
    setEditingId(item.id || null)
    setErrors({})
    setMessage('')
    setForm({
      ...initialForm,
      ...item,
      cep: maskCEP(item.cep || ''),
      logradouro: item.logradouro || '',
      numero: item.numero || '',
      complemento: item.complemento || '',
      bairro: item.bairro || '',
      estado: item.estado || '',
      municipio: item.municipio || '',
      tipo_dano: item.tipo_dano || '',
      risco_estrutural: item.risco_estrutural || '',
      familias_afetadas: item.familias_afetadas ?? 1,
      latitude: item.latitude ?? '',
      longitude: item.longitude ?? '',
      observacoes: item.observacoes || '',
      familia_id: item.familia_id || null,
      necessidade_reconstrucao: !!item.necessidade_reconstrucao,
    })
  }

  return (
    <>
      <Topbar
        title="Moradias Afetadas"
        subtitle="Cadastro, consulta, edição e remoção de moradias impactadas."
      />

      <div className="page-card mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="h5 mb-1">Importação em lote</h2>
            <p className="text-muted mb-0">
              Envie um arquivo Excel no template do módulo.
            </p>
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <DownloadTemplateButton href="/templates/rede_import_template_moradias_afetadas.xlsx" />
            <ImportExcelButton
              endpoint="/api/moradias-afetadas/import"
              onImported={async () => {
                await loadItems()
              }}
            />
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert ${Object.keys(errors).length ? 'alert-warning' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">{editingId ? 'Editar moradia' : 'Nova moradia'}</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Família vinculada (opcional)</label>
            <Select
              styles={selectStyles}
              options={familiaOptions}
              value={familiaOptions.find(item => item.value === form.familia_id) || null}
              onChange={(option: any) => updateField('familia_id', option?.value || null)}
              onInputChange={(value: string) => buscarFamilias(value)}
              placeholder="Buscar por nome, CPF ou município"
              isClearable
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">CEP</label>
            <input
              className={`form-control ${errors.cep ? 'is-invalid' : ''}`}
              value={form.cep || ''}
              onChange={e => updateField('cep', e.target.value)}
              onBlur={handleCepBlur}
            />
            <div className="invalid-feedback">{errors.cep}</div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Número</label>
            <input
              className={`form-control ${errors.numero ? 'is-invalid' : ''}`}
              value={form.numero || ''}
              onChange={e => updateField('numero', e.target.value)}
            />
            <div className="invalid-feedback">{errors.numero}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Logradouro</label>
            <input
              className={`form-control ${errors.logradouro ? 'is-invalid' : ''}`}
              value={form.logradouro || ''}
              onChange={e => updateField('logradouro', e.target.value)}
            />
            <div className="invalid-feedback">{errors.logradouro}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Complemento</label>
            <input
              className="form-control"
              value={form.complemento || ''}
              onChange={e => updateField('complemento', e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Bairro</label>
            <input
              className={`form-control ${errors.bairro ? 'is-invalid' : ''}`}
              value={form.bairro || ''}
              onChange={e => updateField('bairro', e.target.value)}
            />
            <div className="invalid-feedback">{errors.bairro}</div>
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

          <div className="col-md-2">
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
            <label className="form-label">Tipo de dano</label>
            <Select
              styles={selectStyles}
              options={tiposDanoMoradia}
              value={tiposDanoMoradia.find(item => item.value === form.tipo_dano) || null}
              onChange={(option: any) => updateField('tipo_dano', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.tipo_dano && <div className="text-danger small mt-1">{errors.tipo_dano}</div>}
          </div>

          <div className="col-md-4">
            <label className="form-label">Risco estrutural</label>
            <Select
              styles={selectStyles}
              options={riscosEstruturais}
              value={riscosEstruturais.find(item => item.value === form.risco_estrutural) || null}
              onChange={(option: any) => updateField('risco_estrutural', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.risco_estrutural && (
              <div className="text-danger small mt-1">{errors.risco_estrutural}</div>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Famílias afetadas</label>
            <input
              type="number"
              className={`form-control ${errors.familias_afetadas ? 'is-invalid' : ''}`}
              value={form.familias_afetadas}
              onChange={e => updateField('familias_afetadas', e.target.value)}
            />
            <div className="invalid-feedback">{errors.familias_afetadas}</div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Latitude</label>
            <input
              className={`form-control ${errors.latitude ? 'is-invalid' : ''}`}
              value={form.latitude ?? ''}
              onChange={e => updateField('latitude', e.target.value)}
            />
            <div className="invalid-feedback">{errors.latitude}</div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Longitude</label>
            <input
              className={`form-control ${errors.longitude ? 'is-invalid' : ''}`}
              value={form.longitude ?? ''}
              onChange={e => updateField('longitude', e.target.value)}
            />
            <div className="invalid-feedback">{errors.longitude}</div>
          </div>

          <div className="col-md-6 d-flex align-items-end">
            <div className="form-check">
              <input
                id="necessidade_reconstrucao"
                type="checkbox"
                className="form-check-input"
                checked={form.necessidade_reconstrucao}
                onChange={e => updateField('necessidade_reconstrucao', e.target.checked)}
              />
              <label htmlFor="necessidade_reconstrucao" className="form-check-label">
                Necessita reconstrução
              </label>
            </div>
          </div>

          <div className="col-12">
            <label className="form-label">Observações</label>
            <textarea
              className="form-control"
              rows={3}
              value={form.observacoes || ''}
              onChange={e => updateField('observacoes', e.target.value)}
            />
          </div>

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar moradia'}
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
          <h2 className="h5 mb-0">Moradias cadastradas</h2>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Buscar por logradouro, bairro ou município"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ minWidth: 300 }}
            />
            <button className="btn btn-outline-primary" onClick={() => loadItems()}>
              Buscar
            </button>
          </div>
        </div>

        <div className="page-card mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">Mapa das moradias afetadas</h2>
          </div>

          <p className="text-muted">
            Visualização geográfica das moradias com latitude e longitude informadas.
          </p>

          <MoradiasMap items={items} />
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Endereço</th>
                <th>Município</th>
                <th>Tipo de dano</th>
                <th>Risco</th>
                <th>Famílias</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.logradouro}, {item.numero}</td>
                  <td>{item.municipio}/{item.estado}</td>
                  <td>{tiposDanoMoradia.find(x => x.value === item.tipo_dano)?.label || item.tipo_dano}</td>
                  <td>{riscosEstruturais.find(x => x.value === item.risco_estrutural)?.label || item.risco_estrutural}</td>
                  <td>{item.familias_afetadas}</td>
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