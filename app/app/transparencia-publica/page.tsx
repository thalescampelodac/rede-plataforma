'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/Topbar'

type Painel = {
  total_doacoes_recebidas: number
  total_distribuido: number
  familias_atendidas: number
  centros_distribuicao_ativos: number
  recursos_financeiros_arrecadados_vaquinhas: number
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

export default function TransparenciaPublicaPage() {
  const [painel, setPainel] = useState<Painel | null>(null)
  const [message, setMessage] = useState('')

  async function loadPainel() {
    try {
      const response = await fetch('/api/transparencia-publica')
      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      if (!response.ok) {
        setMessage(data.message || 'Erro ao carregar painel.')
        return
      }

      setPainel(data.painel)
    } catch {
      setMessage('Erro ao carregar painel.')
    }
  }

  useEffect(() => {
    loadPainel()
  }, [])

  return (
    <>
      <Topbar
        title="Transparência Pública"
        subtitle="Painel público com indicadores consolidados da operação humanitária."
      />

      {message && <div className="alert alert-warning">{message}</div>}

      {!painel ? (
        <div className="page-card">
          <p className="mb-0 text-muted">Carregando painel...</p>
        </div>
      ) : (
        <>
          <div className="page-card mb-4">
            <h2 className="h5 mb-3">Compromisso com a transparência</h2>
            <p className="text-muted mb-0">
              Este painel apresenta os principais indicadores públicos da operação,
              oferecendo visibilidade sobre arrecadação, distribuição de apoio,
              atendimento às famílias e mobilização de centros de distribuição.
            </p>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-4">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Total de Doações Recebidas</div>
                <div className="display-6 fw-semibold">
                  {formatCurrency(painel.total_doacoes_recebidas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-4">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Total Distribuído</div>
                <div className="display-6 fw-semibold">
                  {formatCurrency(painel.total_distribuido)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-4">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Famílias Atendidas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(painel.familias_atendidas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-6">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Centros de Distribuição Ativos</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(painel.centros_distribuicao_ativos)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-6">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">
                  Recursos Financeiros Arrecadados (Vaquinhas)
                </div>
                <div className="display-6 fw-semibold">
                  {formatCurrency(painel.recursos_financeiros_arrecadados_vaquinhas)}
                </div>
              </div>
            </div>
          </div>

          <div className="page-card">
            <h2 className="h5 mb-3">Resumo Público</h2>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Indicador público</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total de Doações Recebidas</td>
                    <td>{formatCurrency(painel.total_doacoes_recebidas)}</td>
                  </tr>
                  <tr>
                    <td>Total Distribuído</td>
                    <td>{formatCurrency(painel.total_distribuido)}</td>
                  </tr>
                  <tr>
                    <td>Famílias Atendidas</td>
                    <td>{formatNumber(painel.familias_atendidas)}</td>
                  </tr>
                  <tr>
                    <td>Centros de Distribuição Ativos</td>
                    <td>{formatNumber(painel.centros_distribuicao_ativos)}</td>
                  </tr>
                  <tr>
                    <td>Recursos Financeiros Arrecadados (Vaquinhas)</td>
                    <td>{formatCurrency(painel.recursos_financeiros_arrecadados_vaquinhas)}</td>
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