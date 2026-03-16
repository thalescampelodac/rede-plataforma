import Topbar from './Topbar'

export default function ConstructionPage({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <>
      <Topbar
        title={title}
        subtitle="Este módulo já está previsto na plataforma e será implementado em uma próxima etapa."
      />

      <div className="page-card">
        <div className="text-center py-5">
          <div className="placeholder-icon">🚧</div>
          <h2 className="h4 mb-3">Funcionalidade em construção</h2>
          <p className="text-muted mb-3">
            {description || 'A estrutura deste módulo já está prevista no sistema.'}
          </p>
          <span className="badge-construction">Em construção</span>
        </div>
      </div>
    </>
  )
}
