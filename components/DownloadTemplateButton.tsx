'use client'

type Props = {
  href: string
  label?: string
}

export default function DownloadTemplateButton({
  href,
  label = 'Baixar template',
}: Props) {
  return (
    <a
      href={href}
      download
      className="btn btn-outline-success"
    >
      {label}
    </a>
  )
}