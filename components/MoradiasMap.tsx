'use client'

import { useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

type Moradia = {
  id?: string
  logradouro: string
  numero: string
  bairro: string
  municipio: string
  estado: string
  tipo_dano: string
  risco_estrutural: string
  familias_afetadas: number | string
  latitude?: number | string | null
  longitude?: number | string | null
}

const markerIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function formatTipoDano(value: string) {
  const map: Record<string, string> = {
    alagamento: 'Alagamento',
    deslizamento: 'Deslizamento',
    desabamento_parcial: 'Desabamento parcial',
    desabamento_total: 'Desabamento total',
    rachaduras_estruturais: 'Rachaduras estruturais',
    destelhamento: 'Destelhamento',
    interdicao: 'Interdição',
    outros: 'Outros',
  }

  return map[value] || value
}

function formatRisco(value: string) {
  const map: Record<string, string> = {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
  }

  return map[value] || value
}

export default function MoradiasMap({ items }: { items: Moradia[] }) {
  const points = useMemo(() => {
    return items
      .map(item => {
        const lat = Number(item.latitude)
        const lng = Number(item.longitude)

        if (Number.isNaN(lat) || Number.isNaN(lng)) return null

        return {
          ...item,
          lat,
          lng,
        }
      })
      .filter(Boolean) as Array<Moradia & { lat: number; lng: number }>
  }, [items])

  const center: [number, number] =
    points.length > 0
      ? [points[0].lat, points[0].lng]
      : [-21.7624, -43.3484]

  return (
    <div style={{ height: 420, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%', borderRadius: 16 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map(item => (
          <Marker
            key={item.id || `${item.logradouro}-${item.numero}-${item.lat}-${item.lng}`}
            position={[item.lat, item.lng]}
            icon={markerIcon}
          >
            <Popup>
              <div style={{ minWidth: 220 }}>
                <strong>
                  {item.logradouro}, {item.numero}
                </strong>
                <br />
                {item.bairro} — {item.municipio}/{item.estado}
                <hr />
                <div><strong>Tipo de dano:</strong> {formatTipoDano(item.tipo_dano)}</div>
                <div><strong>Risco:</strong> {formatRisco(item.risco_estrutural)}</div>
                <div><strong>Famílias afetadas:</strong> {item.familias_afetadas}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}