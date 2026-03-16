import Link from 'next/link'
import Topbar from '@/components/Topbar'
import { menuItems } from '@/lib/menu'

export default function AppHomePage() {
  const ativos = menuItems.filter(item => item.enabled)
  const futuros = menuItems.filter(item => !item.enabled)

  return (
    <>
      <Topbar
        title="Visão geral da REDE"
        subtitle="Módulos disponíveis para esta primeira entrega da plataforma."
      />

      <div className="page-card mb-4">
        <h2 className="h5 mb-3">Sobre esta versão</h2>
        <p className="text-muted mb-0">
          Esta entrega apresenta a estrutura base da plataforma REDE com navegação,
          identidade visual, módulos ativos e preparação para expansão futura.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-xl-7">
          <div className="page-card h-100">
            <h2 className="h5 mb-3">Módulos ativos</h2>

            <div className="row g-3">
              {ativos.map(item => (
                <div className="col-md-6" key={item.href}>
                  <div className="quick-link-card h-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="quick-link-title">{item.label}</div>
                      <span className="badge-active">Ativo</span>
                    </div>

                    <p className="text-muted small">{item.description}</p>

                    <Link href={item.href} className="btn btn-sm btn-primary">
                      Acessar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-5">
          <div className="page-card h-100">
            <h2 className="h5 mb-3">Em construção</h2>

            <div className="d-grid gap-2">
              {futuros.map(item => (
                <Link key={item.href} href={item.href} className="menu-link m-0">
                  <span>{item.label}</span>
                  <span className="badge-construction">Em construção</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
