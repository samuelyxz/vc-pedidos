import { useState, useRef } from 'react';
import { Download, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { VC_GREEN, VC_GREEN_BG } from '../lib/constants.js';
import { downloadBackup, applyBackup } from '../lib/backup.js';

export function BackupCard() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    setError('');
    setMsg('');
    try {
      const keys = await downloadBackup();
      setMsg(
        keys.length
          ? `Backup gerado (${keys.length} ${
              keys.length === 1 ? 'seção' : 'seções'
            } de dados).`
          : 'Nada salvo ainda para exportar.'
      );
      setTimeout(() => setMsg(''), 4000);
    } catch {
      setError('Não consegui gerar o backup.');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setMsg('');
    if (
      !confirm(
        'Importar vai SOBRESCREVER os clientes, pedidos, bonificações e catálogo deste navegador com o conteúdo do arquivo. Continuar?'
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const parsed = JSON.parse(await file.text());
      const keys = await applyBackup(parsed);
      setMsg(
        `Importado: ${keys.join(', ')}. Recarregando o app...`
      );
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? 'Arquivo não é um JSON válido.'
          : err.message || 'Falha ao importar o backup.'
      );
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
      <h3 className="font-semibold text-stone-900 text-sm mb-2">
        Backup dos dados
      </h3>
      <p className="text-xs text-stone-500 mb-3">
        Clientes, pedidos, bonificações e catálogo ficam salvos só neste
        navegador. Exporte um arquivo <code className="bg-stone-100 px-1 rounded">.json</code>{' '}
        de vez em quando — e antes de trocar de computador ou navegador.
      </p>

      <input
        type="file"
        accept="application/json,.json"
        ref={fileInputRef}
        onChange={handleImportFile}
        style={{ display: 'none' }}
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleExport}
          disabled={busy}
          className="flex-1 text-white font-medium text-sm py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: VC_GREEN }}
        >
          <Download size={14} />
          Exportar backup
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex-1 text-sm font-medium py-2 rounded-lg border flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ borderColor: VC_GREEN, color: VC_GREEN }}
        >
          {busy ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          Importar backup
        </button>
      </div>

      {msg && (
        <div
          className="mt-3 text-xs py-1.5 px-2 rounded"
          style={{ backgroundColor: VC_GREEN_BG, color: VC_GREEN }}
        >
          ✓ {msg}
        </div>
      )}
      {error && (
        <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
          <div className="flex items-start gap-1.5">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
