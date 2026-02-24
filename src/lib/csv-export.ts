export interface CsvColumn<T> {
  header: string
  accessor: (row: T) => string | number
}

function escapeField(value: string | number): string {
  const str = String(value)
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function toCsvString<T>(columns: CsvColumn<T>[], data: T[]): string {
  const headerRow = columns.map((col) => escapeField(col.header)).join(',')
  const dataRows = data.map((row) =>
    columns.map((col) => escapeField(col.accessor(row))).join(','),
  )
  return [headerRow, ...dataRows].join('\n')
}

export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
