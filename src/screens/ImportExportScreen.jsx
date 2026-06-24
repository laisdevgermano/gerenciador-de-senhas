import { useState } from 'react'
import {
  Download,
  Upload,
  FileText,
  Shield,
  Check,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react'
import Button from '../components/Button'
import Badge from '../components/Badge'

/* FUTURE: integração com csv/json parser
 *   import { parse } from 'csv-parse/sync'
 *   const records = parse(fileContent, { columns: true }) */
export default function ImportExportScreen() {
  const [importStep, setImportStep] = useState('idle') // idle | selected | done
  const [exportFormat, setExportFormat] = useState('csv')

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportStep('selected')
      /* FUTURE: ler arquivo e processar
       *   const reader = new FileReader()
       *   reader.onload = () => {
       *     const data = parse(reader.result)
       *     await api.post('/passwords/import', data)
       *   }
       *   reader.readAsText(file) */
    }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Importar / Exportar</h2>
        <p className="text-sm text-text-muted">Transfira suas senhas de e para outros sistemas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
            <Download size={20} className="text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Exportar senhas</h3>
            <p className="text-xs text-text-muted mt-1">
              Baixe suas senhas em formato CSV ou JSON.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-text-primary block mb-1.5">Formato</label>
            <div className="flex gap-2">
              {['csv', 'json'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                    exportFormat === fmt
                      ? 'border-brand bg-brand-light text-brand font-medium'
                      : 'border-border text-text-secondary hover:border-border-hover'
                  }`}
                >
                  {fmt === 'csv' ? <FileSpreadsheet size={14} /> : <FileText size={14} />}
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={() => {
              /* FUTURE: exportar dados via API
               *   const blob = await api.get(`/passwords/export?format=${exportFormat}`, { responseType: 'blob' })
               *   const url = URL.createObjectURL(blob)
               *   const a = document.createElement('a'); a.href = url; a.download = `senhas.${exportFormat}`
               *   a.click() */
              alert(`Exportação em ${exportFormat.toUpperCase()} simulada.`)
            }}
          >
            Exportar
          </Button>

          <p className="text-xs text-text-muted">
            <Shield size={12} className="inline mr-1" />
            Os dados serão descriptografados antes da exportação.
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
            <Upload size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Importar senhas</h3>
            <p className="text-xs text-text-muted mt-1">
              Importe de outros gerenciadores (CSV, JSON, Passbolt).
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">Use o template para formatar seus dados</p>
            <button
              onClick={() => {
                /* Gera CSV template */
                const headers = 'name,username,password,url,notes,tags'
                const sample = 'AWS Console,admin@exemplo.com,minha-senha,https://aws.com,nota opcional,devops;cloud'
                const bom = '\uFEFF'
                const blob = new Blob([bom + headers + '\n' + sample + '\n'], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'template-importar-senhas.csv'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="text-xs text-brand hover:underline font-medium cursor-pointer"
            >
              Baixar template CSV
            </button>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-brand/50 transition-colors">
            {importStep === 'idle' && (
              <label className="cursor-pointer">
                <Upload size={24} className="text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-secondary">
                  Clique para selecionar ou arraste o arquivo
                </p>
                <p className="text-xs text-text-muted mt-1">CSV ou JSON</p>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
            {importStep === 'selected' && (
              <div className="flex flex-col items-center gap-2">
                <Check size={24} className="text-success" />
                <p className="text-sm text-text-primary">Arquivo selecionado</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setImportStep('idle')}>
                    Importar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setImportStep('idle')}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            )}
            {importStep === 'done' && (
              <div className="flex flex-col items-center gap-2">
                <Check size={24} className="text-success" />
                <p className="text-sm text-text-primary">Importado com sucesso!</p>
                <Button variant="ghost" size="sm" onClick={() => setImportStep('idle')}>
                  Importar outro
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-text-muted">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <span>Formatos suportados: CSV (Bitwarden, LastPass), JSON (Passbolt).</span>
          </div>
        </div>
      </div>
    </div>
  )
}
