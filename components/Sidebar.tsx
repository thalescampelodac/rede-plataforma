'use client'

import Image from 'next/image'
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
        <div className="sidebar-brand-mark">
          <Image
            src="/logo_rede.svg"
            alt="Logo da plataforma REDE"
            width={132}
            height={132}
            priority
          />
        </div>
        <div className="sidebar-brand-title">REDE</div>
        <div className="sidebar-brand-subtitle">
          Plataforma Nacional de Coordenacao Humanitaria
        </div>
      </div>

      <Link
        href="/app"
        className={`menu-link ${pathname === '/app' ? 'active' : ''}`}
      >
        <span>Inicio do sistema</span>
      </Link>

      <div className="menu-section-title">Modulos funcionais</div>
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

      <div className="menu-section-title">Em construcao</div>
      {construcao.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`menu-link ${pathname === item.href ? 'active' : ''}`}
        >
          <span>{item.label}</span>
          <span className="badge-construction">Em construcao</span>
        </Link>
      ))}
    </aside>
  )
}
