import * as XLSX from 'xlsx'

export function normalizeSheetName(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function normalizeHeader(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function findHeaderRowIndex(rows: any[][], expectedHeaders: string[]) {
  const normalizedExpected = expectedHeaders.map(normalizeHeader)

  for (let i = 0; i < rows.length; i++) {
    const row = (rows[i] || []).map(normalizeHeader)

    const hits = normalizedExpected.filter((header) => row.includes(header)).length

    if (hits >= Math.min(3, normalizedExpected.length)) {
      return i
    }
  }

  return -1
}

export function parseExcelFile(
  fileBuffer: ArrayBuffer,
  preferredSheetName?: string,
  expectedHeaders: string[] = []
) {
  const workbook = XLSX.read(fileBuffer, { type: 'array' })

  const normalizedNames = workbook.SheetNames.map((name) => ({
    original: name,
    normalized: normalizeSheetName(name),
  }))

  let targetSheetName = workbook.SheetNames[0]

  if (preferredSheetName) {
    const preferredNormalized = normalizeSheetName(preferredSheetName)

    const found = normalizedNames.find(
      (item) => item.normalized === preferredNormalized
    )

    if (found) {
      targetSheetName = found.original
    }
  }

  const worksheet = workbook.Sheets[targetSheetName]

  const matrix = XLSX.utils.sheet_to_json<any[]>(worksheet, {
    header: 1,
    defval: '',
    raw: false,
  })

  let headerRowIndex = 0

  if (expectedHeaders.length > 0) {
    const foundIndex = findHeaderRowIndex(matrix, expectedHeaders)
    if (foundIndex >= 0) {
      headerRowIndex = foundIndex
    }
  }

  const headers = (matrix[headerRowIndex] || []).map((h) => String(h || '').trim())
  const dataRows = matrix.slice(headerRowIndex + 1)

  const rows = dataRows
    .filter((row) => row.some((cell: any) => String(cell ?? '').trim() !== ''))
    .map((row) => {
      const obj: Record<string, any> = {}
      headers.forEach((header, index) => {
        obj[header] = row[index] ?? ''
      })
      return obj
    })

  return {
    workbook,
    sheetName: targetSheetName,
    rows,
    headerRowIndex,
    headers,
  }
}

export function normalizeBoolean(value: unknown) {
  const text = String(value ?? '').trim().toLowerCase()
  return ['true', '1', 'sim', 'yes', 'y'].includes(text)
}

export function normalizeNumber(value: unknown) {
  const text = String(value ?? '').trim()
  if (!text) return 0
  const normalized = text.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isNaN(n) ? 0 : n
}

export function createImportResultWorkbook(
  rows: Array<Record<string, any>>
) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'resultado_importacao')
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}