'use client'

import { useEffect, useState } from 'react'
import Select from 'react-select'
import Topbar from '@/components/Topbar'
import {
  categoriasItem,
  centrosDistribuicao,
  unidadesMedida,
} from '@/lib/brazil'

type Transferencia = {
  id?: string
  centro_origem: string
  centro_destino: string
  data_transferencia: string
  nome_item: string
  categoria_item: string
  quantidade: string | number
  unidade: string
  responsavel_envio: string
  responsavel_recebimento: string
  status_transferencia: string
  observacoes: string
}

const initialForm: Transferencia = {
  centro_origem: '',
  centro_destino: '',
  data_transferencia: '',
  nome_item: '',
  categoria_item: '',
  quantidade: '',
  unidade: '',
  responsavel_envio: '',
  responsavel_recebimento: '',
  status_transferencia: 'enviado',
  observacoes: '',
}

const statusTransferencia = [
  { value: 'enviado', label: 'Enviado' },
  { value: 'em_transito', label: 'Em trânsito' },
  { value: 'recebido', label: 'Recebido' },
  { value: 'cancelado', label: 'Cancelado' },
]

const selectStyles = {
  control: (base: any) => ({
    ...base,
    minHeight: 38,
    borderColor: '#dee2e6',
    boxShadow: 'none',
  }),
}

export default function TransferenciasCentrosPage() {
  const [form, setForm] = useState<Transferencia>(initialForm)
  const [items, setItems] = useState<Transferencia[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadItems(search = query) {
    try {
      const response = await fetch(`/api/transferencias-centros?q=${encodeURIComponent(search)}`)
      const text = await response.text()
      const data = text ? JSON.parse(text) : { items: [] }

      if (!response.ok) {
        setMessage(data.message || 'Erro ao consultar transferências.')
        setItems([])
        return
      }

      setItems(data.items || [])
    } catch {
      setMessage('Erro ao consultar transferências.')
      setItems([])
    }
  }

  useEffect(() => {
    loadItems('')
  }, [])

  function updateField<K extends keyof Transferencia>(field: K, value: Transferencia[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage('')

    const url = editingId
      ? `/api/transferencias-centros/${editingId}`
      : '/api/transferencias-centros'

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
      const response = await fetch(`/api/transferencias-centros/${id}`, {
        method: 'DELETE',
      })

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      setMessage(data.message || '')
      await loadItems()
    } catch {
      setMessage('Erro ao remover transferência.')
    }
  }

  function handleEdit(item: Transferencia) {
    setEditingId(item.id || null)
    setErrors({})
    setMessage('')
    setForm({
      ...initialForm,
      ...item,
      responsavel_recebimento: item.responsavel_recebimento || '',
      observacoes: item.observacoes || '',
    })
  }

  return (
    <>
      <Topbar
        title="Transferência entre Centros"
        subtitle="Cadastro, consulta, edição e remoção de transferências logísticas."
      />

      {message && (
        <div className={`alert ${Object.keys(errors).length ? 'alert-warning' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">
          {editingId ? 'Editar transferência' : 'Nova transferência'}
        </h2>

        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Centro de origem</label>
            <Select
              styles={selectStyles}
              options={centrosDistribuicao}
              value={centrosDistribuicao.find(item => item.value === form.centro_origem) || null}
              onChange={(option: any) => updateField('centro_origem', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.centro_origem && (
              <div className="text-danger small mt-1">{errors.centro_origem}</div>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Centro de destino</label>
            <Select
              styles={selectStyles}
              options={centrosDistribuicao}
              value={centrosDistribuicao.find(item => item.value === form.centro_destino) || null}
              onChange={(option: any) => updateField('centro_destino', option?.value || '')}
              placeholder="Selecione"
              isClearable
            />
            {errors.centro_destino && (
              <div className="text-danger small mt-1">{errors.centro_destino}</div>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Data da transferência</label>
            <input
              type="date"
              className={`form-control ${errors.data_transferencia ? 'is-invalid' : ''}`}
              value={form.data_transferencia}
              onChange={e => updateField('data_transferencia', e.target.value)}
            />
            <div className="invalid-feedback">{errors.data_transferencia}</div>
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

          <div className="col-md-3">
            <label className="form-label">Nome do item</label>
            <input
              className={`form-control ${errors.nome_item ? 'is-invalid' : ''}`}
              value={form.nome_item}
              onChange={e => updateField('nome_item', e.target.value)}
            />
            <div className="invalid-feedback">{errors.nome_item}</div>
          </div>

          <div className="col-md-2">
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
            {errors.unidade && (
              <div className="text-danger small mt-1">{errors.unidade}</div>
            )}
          </div>

          <div className="col-md-2">
            <label className="form-label">Status</label>
            <Select
              styles={selectStyles}
              options={statusTransferencia}
              value={statusTransferencia.find(item => item.value === form.status_transferencia) || null}
              onChange={(option: any) => updateField('status_transferencia', option?.value || '')}
              placeholder="Selecione"
              isClearable={false}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Responsável pelo envio</label>
            <input
              className={`form-control ${errors.responsavel_envio ? 'is-invalid' : ''}`}
              value={form.responsavel_envio}
              onChange={e => updateField('responsavel_envio', e.target.value)}
            />
            <div className="invalid-feedback">{errors.responsavel_envio}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Responsável pelo recebimento</label>
            <input
              className="form-control"
              value={form.responsavel_recebimento}
              onChange={e => updateField('responsavel_recebimento', e.target.value)}
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
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Registrar transferência'}
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
          <h2 className="h5 mb-0">Transferências cadastradas</h2>

          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Buscar por item, origem ou destino"
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
                <th>Origem</th>
                <th>Destino</th>
                <th>Item</th>
                <th>Qtd.</th>
                <th>Status</th>
                <th>Data</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.centro_origem}</td>
                  <td>{item.centro_destino}</td>
                  <td>{item.nome_item}</td>
                  <td>{item.quantidade} {item.unidade}</td>
                  <td>
                    {statusTransferencia.find(x => x.value === item.status_transferencia)?.label ||
                      item.status_transferencia}
                  </td>
                  <td>{item.data_transferencia}</td>
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
                    Nenhuma transferência encontrada.
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