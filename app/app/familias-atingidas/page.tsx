'use client'

import { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import Topbar from '@/components/Topbar'
import { buscarCep } from '@/lib/cep'
import { estados, necessidadesPrioritarias, situacoesMoradia } from '@/lib/brazil'
import { maskCEP, maskCPF, maskCurrency, maskPhone } from '@/lib/masks'
import ImportExcelButton from '@/components/ImportExcelButton'
import DownloadTemplateButton from '@/components/DownloadTemplateButton'

type Option = {
  value: string
  label: string
}

type Familia = {
  id?: string
  ihu?: string
  nome_responsavel: string
  cpf: string
  telefone: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  estado: string
  municipio: string
  total_moradores: number | string
  criancas: number | string
  adolescentes: number | string
  adultos: number | string
  idosos: number | string
  pcd: number | string
  gestantes: number | string
  bebes: number | string
  situacao_moradia: string
  renda_familiar_estimada: string
  ocupacao_responsavel: string
  perda_renda: boolean
  necessidades_prioritarias: string[]
}

const initialForm: Familia = {
  ihu: '',
  nome_responsavel: '',
  cpf: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  estado: '',
  municipio: '',
  total_moradores: '',
  criancas: 0,
  adolescentes: 0,
  adultos: 0,
  idosos: 0,
  pcd: 0,
  gestantes: 0,
  bebes: 0,
  situacao_moradia: '',
  renda_familiar_estimada: '',
  ocupacao_responsavel: '',
  perda_renda: false,
  necessidades_prioritarias: [],
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: 38,
    borderColor: '#dee2e6',
    boxShadow: 'none',
  }),
}

export default function FamiliasAtingidasPage() {
  const [form, setForm] = useState<Familia>(initialForm)
  const [items, setItems] = useState<Familia[]>([])
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
    const response = await fetch(`/api/familias-atingidas?q=${encodeURIComponent(search)}`)
    const data = await response.json()
    setItems(data.items || [])
  }

  useEffect(() => {
    loadItems('')
  }, [])

  function updateField<K extends keyof Familia>(field: K, value: Familia[K]) {
    let newValue: any = value

    if (field === 'cpf') newValue = maskCPF(String(value))
    if (field === 'telefone') newValue = maskPhone(String(value))
    if (field === 'cep') newValue = maskCEP(String(value))
    if (field === 'renda_familiar_estimada') {
      const digits = String(value).replace(/\D/g, '')
      newValue = digits ? maskCurrency(digits) : ''
    }

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
      ? `/api/familias-atingidas/${editingId}`
      : '/api/familias-atingidas'

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

    const response = await fetch(`/api/familias-atingidas/${id}`, {
      method: 'DELETE',
    })

    const data = await response.json()
    setMessage(data.message || '')
    await loadItems()
  }

  function handleEdit(item: Familia) {
    setEditingId(item.id || null)
    setErrors({})
    setMessage('')
    setForm({
      ...initialForm,
      ...item,
      cpf: maskCPF(item.cpf || ''),
      telefone: maskPhone(item.telefone || ''),
      cep: maskCEP(item.cep || ''),
      renda_familiar_estimada: item.renda_familiar_estimada
        ? Number(item.renda_familiar_estimada).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })
        : '',
    })
  }

  const necessidadeOptions = useMemo(
    () => necessidadesPrioritarias.map(item => ({ value: item.value, label: item.label })),
    []
  )

  const estadoOption = estados.find(item => item.value === form.estado) || null
  const situacaoOption = situacoesMoradia
    .map(item => ({ value: item.value, label: item.label }))
    .find(item => item.value === form.situacao_moradia) || null

  return (
    <>
      <Topbar
        title="Famílias Atingidas"
        subtitle="Cadastro, consulta, edição e remoção de famílias impactadas."
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
			  <DownloadTemplateButton href="/templates/rede_import_template_fase1_limpo.xlsx" />
			  <ImportExcelButton
				endpoint="/api/familias-atingidas/import"
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
        <h2 className="h5 mb-3">{editingId ? 'Editar família' : 'Nova família'}</h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-8">
            <label className="form-label">Nome do responsável</label>
            <input
              className={`form-control ${errors.nome_responsavel ? 'is-invalid' : ''}`}
              value={form.nome_responsavel}
              onChange={e => updateField('nome_responsavel', e.target.value)}
            />
            <div className="invalid-feedback">{errors.nome_responsavel}</div>
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
            <label className="form-label">CEP</label>
            <input
              className={`form-control ${errors.cep ? 'is-invalid' : ''}`}
              value={form.cep}
              onChange={e => updateField('cep', e.target.value)}
              onBlur={handleCepBlur}
            />
            <div className="invalid-feedback">{errors.cep}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Número</label>
            <input
              className={`form-control ${errors.numero ? 'is-invalid' : ''}`}
              value={form.numero}
              onChange={e => updateField('numero', e.target.value)}
            />
            <div className="invalid-feedback">{errors.numero}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Logradouro</label>
            <input
              className={`form-control ${errors.logradouro ? 'is-invalid' : ''}`}
              value={form.logradouro}
              onChange={e => updateField('logradouro', e.target.value)}
            />
            <div className="invalid-feedback">{errors.logradouro}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Complemento</label>
            <input
              className="form-control"
              value={form.complemento}
              onChange={e => updateField('complemento', e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Bairro</label>
            <input
              className={`form-control ${errors.bairro ? 'is-invalid' : ''}`}
              value={form.bairro}
              onChange={e => updateField('bairro', e.target.value)}
            />
            <div className="invalid-feedback">{errors.bairro}</div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Estado</label>
            <Select
              styles={selectStyles}
              options={estados}
              value={estadoOption}
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

          <div className="col-md-3">
            <label className="form-label">Total moradores</label>
            <input
              type="number"
              className={`form-control ${errors.total_moradores ? 'is-invalid' : ''}`}
              value={form.total_moradores}
              onChange={e => updateField('total_moradores', e.target.value)}
            />
            <div className="invalid-feedback">{errors.total_moradores}</div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Crianças</label>
            <input type="number" className="form-control" value={form.criancas} onChange={e => updateField('criancas', e.target.value)} />
          </div>

          <div className="col-md-3">
            <label className="form-label">Adolescentes</label>
            <input type="number" className="form-control" value={form.adolescentes} onChange={e => updateField('adolescentes', e.target.value)} />
          </div>

          <div className="col-md-3">
            <label className="form-label">Adultos</label>
            <input type="number" className="form-control" value={form.adultos} onChange={e => updateField('adultos', e.target.value)} />
          </div>

          <div className="col-md-3">
            <label className="form-label">Idosos</label>
            <input type="number" className="form-control" value={form.idosos} onChange={e => updateField('idosos', e.target.value)} />
          </div>

          <div className="col-md-3">
            <label className="form-label">PCD</label>
            <input type="number" className="form-control" value={form.pcd} onChange={e => updateField('pcd', e.target.value)} />
          </div>

          <div className="col-md-3">
            <label className="form-label">Gestantes</label>
            <input type="number" className="form-control" value={form.gestantes} onChange={e => updateField('gestantes', e.target.value)} />
          </div>

          <div className="col-md-3">
            <label className="form-label">Bebês</label>
            <input type="number" className="form-control" value={form.bebes} onChange={e => updateField('bebes', e.target.value)} />
          </div>

          <div className="col-md-6">
            <label className="form-label">Situação da moradia</label>
            <Select
              styles={selectStyles}
              options={situacoesMoradia.map(item => ({ value: item.value, label: item.label }))}
              value={situacaoOption}
              onChange={(option: any) => updateField('situacao_moradia', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.situacao_moradia && (
              <div className="text-danger small mt-1">{errors.situacao_moradia}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Renda familiar estimada</label>
            <input
              className={`form-control ${errors.renda_familiar_estimada ? 'is-invalid' : ''}`}
              value={form.renda_familiar_estimada}
              onChange={e => updateField('renda_familiar_estimada', e.target.value)}
            />
            <div className="invalid-feedback">{errors.renda_familiar_estimada}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Ocupação do responsável</label>
            <input
              className="form-control"
              value={form.ocupacao_responsavel}
              onChange={e => updateField('ocupacao_responsavel', e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Necessidades prioritárias</label>
            <Select
              styles={selectStyles}
              isMulti
              options={necessidadeOptions}
              value={necessidadeOptions.filter(option =>
                form.necessidades_prioritarias.includes(option.value)
              )}
              onChange={(options: any) =>
                updateField(
                  'necessidades_prioritarias',
                  (options || []).map((item: any) => item.value)
                )
              }
              placeholder="Selecione uma ou mais necessidades"
            />
          </div>

          <div className="col-12">
            <div className="form-check">
              <input
                id="perda_renda"
                type="checkbox"
                className="form-check-input"
                checked={form.perda_renda}
                onChange={e => updateField('perda_renda', e.target.checked)}
              />
              <label htmlFor="perda_renda" className="form-check-label">
                Houve perda de renda devido à calamidade
              </label>
            </div>
          </div>

          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar família'}
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
          <h2 className="h5 mb-0">Famílias cadastradas</h2>

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
                <th>Responsável</th>
                <th>CPF</th>
                <th>Município</th>
                <th>UF</th>
                <th>Moradores</th>
                <th>Situação</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.nome_responsavel}</td>
                  <td>{maskCPF(item.cpf || '')}</td>
                  <td>{item.municipio}</td>
                  <td>{item.estado}</td>
                  <td>{item.total_moradores}</td>
                  <td>{situacoesMoradia.find(x => x.value === item.situacao_moradia)?.label || item.situacao_moradia}</td>
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