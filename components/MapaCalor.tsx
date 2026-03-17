'use client'

import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import HeatMapLayer from './HeatMapLayer'

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

export default function MapaCalor({ pontos, heatPoints }: { pontos: Ponto[]; heatPoints: [number, number, number][] }) {
  const center: [number, number] = useMemo(() => {
    if (!pontos.length) return [-21.7624, -43.3484]
    return [pontos[0].latitude, pontos[0].longitude]
  }, [pontos])

  return (
    <div style={{ height: 520, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%', borderRadius: 16 }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <HeatMapLayer points={heatPoints} />

        {pontos.map((ponto) => (
          <CircleMarker
            key={ponto.id}
            center={[ponto.latitude, ponto.longitude]}
            radius={6}
            pathOptions={{ weight: 1 }}
          >
            <Popup>
              <div style={{ minWidth: 260 }}>
                <strong>{ponto.endereco}</strong>
                <br />
                {ponto.bairro} — {ponto.municipio}/{ponto.estado}
                <hr />
                <div><strong>Score:</strong> {ponto.score}</div>
                <div><strong>Famílias afetadas:</strong> {ponto.familias_afetadas}</div>
                <div><strong>Total de moradores:</strong> {ponto.total_moradores}</div>
                <div><strong>Situação:</strong> {ponto.situacao_moradia || '-'}</div>
                <div><strong>Tipo de dano:</strong> {ponto.tipo_dano}</div>
                <div><strong>Risco estrutural:</strong> {ponto.risco_estrutural}</div>
                <div><strong>Família vinculada:</strong> {ponto.familia_nome || '-'}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}