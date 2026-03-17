'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/Topbar'

type Indicadores = {
  total_familias_atingidas: number
  total_familias_assistidas: number
  pessoas_desalojadas: number
  pessoas_desabrigadas: number
  empresas_afetadas: number
  moradias_destruidas: number
  volume_total_doacoes_recebidas: number
  volume_total_distribuido: number
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR')
}

export default function ImpactoGeralPage() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null)
  const [message, setMessage] = useState('')

  async function loadIndicadores() {
    try {
      const response = await fetch('/api/impacto-geral')
      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      if (!response.ok) {
        setMessage(data.message || 'Erro ao carregar indicadores.')
        return
      }

      const raw = data.indicadores || {}

      const mapped: Indicadores = {
        total_familias_atingidas:
          Number(raw.total_familias_atingidas ?? raw.familias_atingidas ?? 0),

        total_familias_assistidas:
          Number(raw.total_familias_assistidas ?? raw.entregas_realizadas ?? 0),

        pessoas_desalojadas:
          Number(raw.pessoas_desalojadas ?? raw.total_desalojadas ?? 0),

        pessoas_desabrigadas:
          Number(raw.pessoas_desabrigadas ?? raw.total_desabrigadas ?? 0),

        empresas_afetadas:
          Number(raw.empresas_afetadas ?? 0),

        moradias_destruidas:
          Number(raw.moradias_destruidas ?? 0),

        volume_total_doacoes_recebidas:
          Number(raw.volume_total_doacoes_recebidas ?? raw.quantidade_doacoes ?? 0),

        volume_total_distribuido:
          Number(raw.volume_total_distribuido ?? raw.quantidade_entregas ?? 0),
      }

      setIndicadores(mapped)
    } catch {
      setMessage('Erro ao carregar indicadores.')
    }
  }

  useEffect(() => {
    loadIndicadores()
  }, [])

  return (
    <>
      <Topbar
        title="Impacto Geral"
        subtitle="Painel consolidado com indicadores estratégicos da operação humanitária."
      />

      {message && <div className="alert alert-warning">{message}</div>}

      {!indicadores ? (
        <div className="page-card">
          <p className="mb-0 text-muted">Carregando indicadores...</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Total de Famílias Atingidas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.total_familias_atingidas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Total de Famílias Assistidas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.total_familias_assistidas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Pessoas Desalojadas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.pessoas_desalojadas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Pessoas Desabrigadas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.pessoas_desabrigadas)}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Empresas Afetadas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.empresas_afetadas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Moradias Destruídas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.moradias_destruidas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Volume Total de Doações Recebidas</div>
                <div className="h3 fw-semibold mb-0">
                  {formatCurrency(indicadores.volume_total_doacoes_recebidas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Volume Total Distribuído</div>
                <div className="h3 fw-semibold mb-0">
                  {formatCurrency(indicadores.volume_total_distribuido)}
                </div>
              </div>
            </div>
          </div>

          <div className="page-card">
            <h2 className="h5 mb-3">Resumo Consolidado</h2>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total de Famílias Atingidas</td>
                    <td>{formatNumber(indicadores.total_familias_atingidas)}</td>
                  </tr>
                  <tr>
                    <td>Total de Famílias Assistidas</td>
                    <td>{formatNumber(indicadores.total_familias_assistidas)}</td>
                  </tr>
                  <tr>
                    <td>Pessoas Desalojadas</td>
                    <td>{formatNumber(indicadores.pessoas_desalojadas)}</td>
                  </tr>
                  <tr>
                    <td>Pessoas Desabrigadas</td>
                    <td>{formatNumber(indicadores.pessoas_desabrigadas)}</td>
                  </tr>
                  <tr>
                    <td>Empresas Afetadas</td>
                    <td>{formatNumber(indicadores.empresas_afetadas)}</td>
                  </tr>
                  <tr>
                    <td>Moradias Destruídas</td>
                    <td>{formatNumber(indicadores.moradias_destruidas)}</td>
                  </tr>
                  <tr>
                    <td>Volume Total de Doações Recebidas</td>
                    <td>{formatCurrency(indicadores.volume_total_doacoes_recebidas)}</td>
                  </tr>
                  <tr>
                    <td>Volume Total Distribuído</td>
                    <td>{formatCurrency(indicadores.volume_total_distribuido)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}