import 'bootstrap/dist/css/bootstrap.min.css'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'REDE - Plataforma Nacional de Coordenação Humanitária',
  description: 'Sistema de apoio ao cadastro, coordenação e acompanhamento humanitário',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
