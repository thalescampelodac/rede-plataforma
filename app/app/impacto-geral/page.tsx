'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/Topbar'

type Indicadores = {
  familias_atingidas: number
  empresas_afetadas: number
  voluntarios_ativos: number
  moradias_afetadas: number
  programas_governamentais: number
  beneficios_concedidos: number
  doacoes_recebidas: number
  itens_estoque: number
  entregas_realizadas: number
  transferencias_centros: number
  familias_em_moradias: number
  valor_programas: number
  valor_beneficios: number
  quantidade_doacoes: number
  quantidade_estoque: number
  quantidade_entregas: number
  quantidade_transferencias: number
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

      setIndicadores(data.indicadores)
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
        subtitle="Painel consolidado com indicadores da operação humanitária."
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
                <div className="text-muted small mb-2">Famílias atingidas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.familias_atingidas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Moradias afetadas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.moradias_afetadas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Empresas afetadas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.empresas_afetadas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Voluntários ativos</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.voluntarios_ativos)}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Benefícios concedidos</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.beneficios_concedidos)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Doações recebidas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.doacoes_recebidas)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Itens em estoque</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.itens_estoque)}
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="page-card h-100">
                <div className="text-muted small mb-2">Entregas realizadas</div>
                <div className="display-6 fw-semibold">
                  {formatNumber(indicadores.entregas_realizadas)}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-xl-6">
              <div className="page-card h-100">
                <h2 className="h5 mb-3">Resumo financeiro</h2>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="soft-card p-3">
                      <div className="text-muted small mb-2">Valor total em programas</div>
                      <div className="h4 mb-0">{formatCurrency(indicadores.valor_programas)}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="soft-card p-3">
                      <div className="text-muted small mb-2">Valor total em benefícios</div>
                      <div className="h4 mb-0">{formatCurrency(indicadores.valor_beneficios)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-6">
              <div className="page-card h-100">
                <h2 className="h5 mb-3">Resumo operacional</h2>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="soft-card p-3">
                      <div className="text-muted small mb-2">Qtd. total de doações</div>
                      <div className="h4 mb-0">{formatNumber(indicadores.quantidade_doacoes)}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="soft-card p-3">
                      <div className="text-muted small mb-2">Qtd. total em estoque</div>
                      <div className="h4 mb-0">{formatNumber(indicadores.quantidade_estoque)}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="soft-card p-3">
                      <div className="text-muted small mb-2">Qtd. total entregue</div>
                      <div className="h4 mb-0">{formatNumber(indicadores.quantidade_entregas)}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="soft-card p-3">
                      <div className="text-muted small mb-2">Qtd. transferida</div>
                      <div className="h4 mb-0">
                        {formatNumber(indicadores.quantidade_transferencias)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="page-card">
            <h2 className="h5 mb-3">Resumo consolidado</h2>
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
                    <td>Famílias atingidas</td>
                    <td>{formatNumber(indicadores.familias_atingidas)}</td>
                  </tr>
                  <tr>
                    <td>Famílias associadas às moradias</td>
                    <td>{formatNumber(indicadores.familias_em_moradias)}</td>
                  </tr>
                  <tr>
                    <td>Moradias afetadas</td>
                    <td>{formatNumber(indicadores.moradias_afetadas)}</td>
                  </tr>
                  <tr>
                    <td>Empresas afetadas</td>
                    <td>{formatNumber(indicadores.empresas_afetadas)}</td>
                  </tr>
                  <tr>
                    <td>Voluntários ativos</td>
                    <td>{formatNumber(indicadores.voluntarios_ativos)}</td>
                  </tr>
                  <tr>
                    <td>Programas governamentais</td>
                    <td>{formatNumber(indicadores.programas_governamentais)}</td>
                  </tr>
                  <tr>
                    <td>Benefícios concedidos</td>
                    <td>{formatNumber(indicadores.beneficios_concedidos)}</td>
                  </tr>
                  <tr>
                    <td>Doações recebidas</td>
                    <td>{formatNumber(indicadores.doacoes_recebidas)}</td>
                  </tr>
                  <tr>
                    <td>Itens em estoque</td>
                    <td>{formatNumber(indicadores.itens_estoque)}</td>
                  </tr>
                  <tr>
                    <td>Entregas realizadas</td>
                    <td>{formatNumber(indicadores.entregas_realizadas)}</td>
                  </tr>
                  <tr>
                    <td>Transferências entre centros</td>
                    <td>{formatNumber(indicadores.transferencias_centros)}</td>
                  </tr>
                  <tr>
                    <td>Valor total distribuído em programas</td>
                    <td>{formatCurrency(indicadores.valor_programas)}</td>
                  </tr>
                  <tr>
                    <td>Valor total distribuído em benefícios</td>
                    <td>{formatCurrency(indicadores.valor_beneficios)}</td>
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