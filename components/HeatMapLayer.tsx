'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet.heat'
import { useMap } from 'react-leaflet'

type HeatPoint = [number, number, number]

export default function HeatMapLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return

    const heatLayer = (L as any).heatLayer(points, {
      radius: 28,
      blur: 20,
      maxZoom: 17,
      minOpacity: 0.35,
    })

    heatLayer.addTo(map)

    return () => {
      map.removeLayer(heatLayer)
    }
  }, [map, points])

  return null
}