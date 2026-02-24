import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { toCsvString, downloadCsv, type CsvColumn } from '../csv-export.ts'

interface TestRow {
  name: string
  value: number
}

const columns: CsvColumn<TestRow>[] = [
  { header: 'Name', accessor: (r) => r.name },
  { header: 'Value', accessor: (r) => r.value },
]

describe('toCsvString', () => {
  it('generates a header row from column definitions', () => {
    const csv = toCsvString(columns, [])
    expect(csv).toBe('Name,Value')
  })

  it('generates data rows from array of objects', () => {
    const data: TestRow[] = [
      { name: 'Alpha', value: 10 },
      { name: 'Beta', value: 20 },
    ]
    const csv = toCsvString(columns, data)
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('Name,Value')
    expect(lines[1]).toBe('Alpha,10')
    expect(lines[2]).toBe('Beta,20')
  })

  it('escapes fields containing commas', () => {
    const data: TestRow[] = [{ name: 'Hello, World', value: 1 }]
    const csv = toCsvString(columns, data)
    expect(csv).toContain('"Hello, World"')
  })

  it('escapes fields containing double quotes', () => {
    const cols: CsvColumn<{ desc: string }>[] = [
      { header: 'Description', accessor: (r) => r.desc },
    ]
    const data = [{ desc: 'He said "hi"' }]
    const csv = toCsvString(cols, data)
    expect(csv).toContain('"He said ""hi"""')
  })

  it('escapes fields containing newlines', () => {
    const cols: CsvColumn<{ desc: string }>[] = [
      { header: 'Description', accessor: (r) => r.desc },
    ]
    const data = [{ desc: 'Line1\nLine2' }]
    const csv = toCsvString(cols, data)
    expect(csv).toContain('"Line1\nLine2"')
  })

  it('returns only header row for empty data', () => {
    const csv = toCsvString(columns, [])
    expect(csv).toBe('Name,Value')
    expect(csv.split('\n')).toHaveLength(1)
  })
})

describe('downloadCsv', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>
  let revokeObjectURLMock: ReturnType<typeof vi.fn>
  let clickMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    createObjectURLMock = vi.fn().mockReturnValue('blob:test-url')
    revokeObjectURLMock = vi.fn()
    clickMock = vi.fn()
    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    })
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickMock,
    } as unknown as HTMLAnchorElement)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a Blob, triggers download, and revokes the URL', () => {
    downloadCsv('Name,Value\nAlpha,10', 'test.csv')

    expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob))
    expect(clickMock).toHaveBeenCalledOnce()
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url')
  })
})
