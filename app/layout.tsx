import 'bootstrap/dist/css/bootstrap.min.css'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'REDE - Plataforma Nacional de Coordenacao Humanitaria',
  description: 'Sistema de apoio ao cadastro, coordenacao e acompanhamento humanitario',
  icons: {
    icon: [
      { url: '/logo_rede.svg', type: 'image/svg+xml' },
      { url: '/logo_rede.png', type: 'image/png' },
    ],
    apple: '/logo_rede.png',
    shortcut: '/logo_rede.png',
  },
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
