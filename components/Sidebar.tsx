'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { menuItems } from '@/lib/menu'

export default function Sidebar() {
  const pathname = usePathname()

  const funcionais = menuItems.filter(item => item.section === 'funcionais')
  const construcao = menuItems.filter(item => item.section === 'construcao')

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-title">REDE</div>
        <div className="sidebar-brand-subtitle">
          Plataforma Nacional de Coordenação Humanitária
        </div>
      </div>

      <Link
        href="/app"
        className={`menu-link ${pathname === '/app' ? 'active' : ''}`}
      >
        <span>Início do sistema</span>
      </Link>

      <div className="menu-section-title">Módulos funcionais</div>
      {funcionais.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`menu-link ${pathname === item.href ? 'active' : ''}`}
        >
          <span>{item.label}</span>
          <span className="badge-active">Ativo</span>
        </Link>
      ))}

      <div className="menu-section-title">Em construção</div>
      {construcao.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`menu-link ${pathname === item.href ? 'active' : ''}`}
        >
          <span>{item.label}</span>
          <span className="badge-construction">Em construção</span>
        </Link>
      ))}
    </aside>
  )
}
