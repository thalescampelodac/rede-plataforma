'use client'

import { useRef, useState } from 'react'

type Props = {
  endpoint: string
  onImported?: () => Promise<void> | void
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export default function ImportExcelButton({ endpoint, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleFile(file: File) {
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('text/plain')) {
        const blob = await response.blob()
        const disposition = response.headers.get('content-disposition') || ''
        const match = disposition.match(/filename="(.+)"/)
        const filename = match?.[1] || 'resultado_importacao.txt'

        downloadBlob(blob, filename)

        const imported = response.headers.get('X-Import-Imported') || '0'
        const failed = response.headers.get('X-Import-Failed') || '0'

        setMessage(`Importação concluída. Importadas: ${imported}. Com erro: ${failed}.`)
        
        if (onImported) {
          await onImported()
        }

        return
      }

      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      if (!response.ok) {
        setMessage(data.message || 'Erro ao importar arquivo.')
        return
      }

      setMessage(data.message || 'Importação concluída.')
      if (onImported) {
        await onImported()
      }
    } catch {
      setMessage('Erro ao importar arquivo.')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="form-control"
        style={{ maxWidth: 320 }}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file) await handleFile(file)
        }}
      />
      {loading && <span className="text-muted small">Importando...</span>}
      {message && <span className="small text-muted">{message}</span>}
    </div>
  )
}