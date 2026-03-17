'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Topbar from '@/components/Topbar'

const MapaCalor = dynamic(() => import('@/components/MapaCalor'), {
  ssr: false,
})

type Ponto = {
  id: string
  latitude: number
  longitude: number
  score: number
  endereco: string
  bairro: string
  municipio: string
  estado: string
  tipo_dano: string
  risco_estrutural: string
  familias_afetadas: number
  familia_nome?: string | null
  total_moradores: number
  situacao_moradia?: string | null
}

export default function MapaCalorPage() {
  const [pontos, setPontos] = useState<Ponto[]>([])
  const [heatPoints, setHeatPoints] = useState<[number, number, number][]>([])
  const [maxScore, setMaxScore] = useState(0)
  const [message, setMessage] = useState('')

  async function loadData() {
    try {
      const response = await fetch('/api/mapa-calor')
      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      if (!response.ok) {
        setMessage(data.message || 'Erro ao carregar mapa de calor.')
        return
      }

      setPontos(data.pontos || [])
      setHeatPoints(data.heatPoints || [])
      setMaxScore(Number(data.maxScore || 0))
    } catch {
      setMessage('Erro ao carregar mapa de calor.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <>
      <Topbar
        title="Mapa de Calor"
        subtitle="Visualização geográfica das áreas mais críticas com base em moradias georreferenciadas e severidade associada."
      />

      {message && <div className="alert alert-warning">{message}</div>}

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">Como o ranking é calculado</h2>
        <p className="text-muted mb-2">
          O mapa de calor usa as coordenadas geográficas das moradias afetadas e aplica
          um score de criticidade para cada ponto.
        </p>
        <p className="text-muted mb-0">
          <strong>Fórmula:</strong> base 1 + famílias afetadas + total de moradores +
          bônus pela situação da moradia da família + bônus pelo tipo de dano +
          bônus pelo risco estrutural.
        </p>
      </div>

      <div className="page-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
          <h2 className="h5 mb-0">Mapa de calor das áreas mais afetadas</h2>
          <div className="text-muted small">
            Pontos georreferenciados: <strong>{pontos.length}</strong> | Maior score: <strong>{maxScore}</strong>
          </div>
        </div>

        {pontos.length === 0 ? (
          <p className="mb-0 text-muted">Nenhum ponto georreferenciado encontrado.</p>
        ) : (
          <MapaCalor pontos={pontos} heatPoints={heatPoints} />
        )}
      </div>

      <div className="page-card">
        <h2 className="h5 mb-3">Ranking dos pontos mais críticos</h2>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Local</th>
                <th>Município</th>
                <th>Score</th>
                <th>Famílias</th>
                <th>Moradores</th>
                <th>Dano</th>
                <th>Risco</th>
              </tr>
            </thead>
            <tbody>
              {pontos.slice(0, 15).map((ponto, index) => (
                <tr key={ponto.id}>
                  <td>{index + 1}</td>
                  <td>
                    {ponto.endereco}
                    <br />
                    <span className="text-muted small">{ponto.bairro}</span>
                  </td>
                  <td>{ponto.municipio}/{ponto.estado}</td>
                  <td>{ponto.score}</td>
                  <td>{ponto.familias_afetadas}</td>
                  <td>{ponto.total_moradores}</td>
                  <td>{ponto.tipo_dano}</td>
                  <td>{ponto.risco_estrutural}</td>
                </tr>
              ))}

              {pontos.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    Nenhum ponto disponível para ranking.
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