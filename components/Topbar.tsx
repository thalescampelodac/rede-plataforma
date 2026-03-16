export default function Topbar({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="topbar">
      <h1 className="h4 mb-1">{title}</h1>
      {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
    </div>
  )
}
