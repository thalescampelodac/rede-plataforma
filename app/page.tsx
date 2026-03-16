import Link from 'next/link'
import { menuItems } from '@/lib/menu'

export default function LandingPage() {
  const ativos = menuItems.filter(item => item.enabled)
  const futuros = menuItems.filter(item => !item.enabled)

  return (
    <main className="landing-page py-4 py-md-5">
      <div className="rede-container">
        <section className="hero-section mb-5">
          <div className="hero-badge">Plataforma digital para resposta humanitária</div>

          <h1 className="hero-title">
            REDE
            <br />
            Plataforma Nacional de Coordenação Humanitária
          </h1>

          <p className="hero-text">
            Uma plataforma voltada ao cadastro, organização, coordenação e acompanhamento
            de ações humanitárias, reunindo famílias afetadas, empresas impactadas,
            benefícios, voluntários, moradias e futuras frentes de rastreabilidade,
            logística e transparência pública.
          </p>

          <div className="hero-actions">
            <Link href="/app" className="btn btn-rede-primary">
              Acessar sistema
            </Link>

            <a href="#modulos" className="btn btn-rede-secondary">
              Ver módulos
            </a>
          </div>
        </section>

        <section className="mb-5">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="soft-card info-grid-card">
                <h2 className="section-title">Resposta mais organizada</h2>
                <p className="text-muted mb-0">
                  Centralização de informações para apoiar a operação e a gestão de dados
                  em contextos humanitários.
                </p>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="soft-card info-grid-card">
                <h2 className="section-title">Visão de evolução</h2>
                <p className="text-muted mb-0">
                  Estrutura preparada para crescer com módulos de doações, logística,
                  transparência e auditoria.
                </p>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="soft-card info-grid-card">
                <h2 className="section-title">Entrega incremental</h2>
                <p className="text-muted mb-0">
                  Esta versão apresenta um MVP funcional com módulos principais já prontos
                  para cadastro, consulta e gestão.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="modulos" className="mb-5">
          <h2 className="section-title">Módulos disponíveis</h2>
          <p className="section-subtitle">
            Funcionalidades já preparadas para uso nesta primeira entrega.
          </p>

          <div className="row g-4">
            {ativos.map(item => (
              <div className="col-md-6 col-xl-4" key={item.href}>
                <div className="module-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="module-title">{item.label}</div>
                    <span className="badge-active">Ativo</span>
                  </div>

                  <p className="module-text">{item.description}</p>

                  <Link href={item.href} className="btn btn-primary">
                    Abrir módulo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title">Módulos em evolução</h2>
          <p className="section-subtitle">
            Estrutura já prevista para ampliação futura da plataforma.
          </p>

          <div className="row g-4">
            {futuros.map(item => (
              <div className="col-md-6 col-xl-4" key={item.href}>
                <div className="module-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="module-title">{item.label}</div>
                    <span className="badge-construction">Em construção</span>
                  </div>

                  <p className="module-text">{item.description}</p>

                  <Link href={item.href} className="btn btn-outline-secondary">
                    Visualizar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
