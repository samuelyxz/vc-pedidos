import { useState, useMemo, useRef } from 'react';
import {
  Upload,
  Download,
  AlertCircle,
  RefreshCw,
  FileCheck2,
} from 'lucide-react';
import { VC_GREEN, VC_GREEN_BG } from '../lib/constants.js';
import { uid, todayISO } from '../lib/format.js';
import { parsePriceTable, mergeProducts } from '../lib/catalog.js';
import { downloadBackup, applyBackup } from '../lib/backup.js';
import { useCatalog } from '../state/CatalogContext.jsx';
import { Field } from '../components/Field.jsx';

// ============== CONFIG ==============
export function ConfigView({
  vendedor,
  setVendedor,
  supervisor,
  setSupervisor,
  setClientes,
  setPedidos,
  setPedidoAtual,
}) {
  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <h2 className="text-xl font-semibold text-stone-900 mb-4 hidden md:block">
        Ajustes
      </h2>

      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <h3 className="font-semibold text-stone-900 text-sm mb-3">
          Dados do Vendedor
        </h3>
        <p className="text-xs text-stone-500 mb-3">
          Esses dados aparecem na planilha do pedido e na bonificação. Deixa em
          branco se não quiser.
        </p>
        <div className="space-y-3">
          <Field
            label="Nome"
            value={vendedor.nome}
            onChange={(v) => setVendedor({ ...vendedor, nome: v })}
            placeholder="Ex: Samuel ou nome do seu pai"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Telefone"
              value={vendedor.telefone}
              onChange={(v) => setVendedor({ ...vendedor, telefone: v })}
            />
            <Field
              label="E-mail"
              value={vendedor.email}
              onChange={(v) => setVendedor({ ...vendedor, email: v })}
              type="email"
            />
          </div>
          <Field
            label="Supervisor (para bonificações)"
            value={supervisor}
            onChange={(v) => setSupervisor(v)}
            placeholder="Ex: Estela"
          />
        </div>
      </div>

      <CatalogUpdateCard />

      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <h3 className="font-semibold text-stone-900 text-sm mb-2">
          Formato da Planilha
        </h3>
        <p className="text-xs text-stone-500">
          A planilha é gerada como{' '}
          <code className="bg-stone-100 px-1 rounded">.xls</code> com formatação
          completa (bordas, cabeçalhos, agrupamento por seção). Excel pode
          mostrar um aviso ao abrir — é só clicar em "Sim" / "Abrir mesmo
          assim". Depois de aberto, dá pra salvar como .xlsx normalmente.
        </p>
      </div>

      <BackupCard />

      <div className="bg-white rounded-xl border border-red-200 p-4">
        <h3 className="font-semibold text-red-900 text-sm mb-2">
          Zona de risco
        </h3>
        <p className="text-xs text-stone-600 mb-3">
          Apaga dados salvos neste app.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              if (
                confirm('Limpar pedido atual? (clientes e histórico ficam)')
              ) {
                setPedidoAtual({
                  id: uid(),
                  numero: '',
                  data: todayISO(),
                  clienteId: null,
                  items: [],
                  obs: '',
                });
              }
            }}
            className="text-xs text-stone-700 hover:bg-stone-100 py-1.5 px-2 rounded-lg text-left"
          >
            Limpar apenas o pedido atual
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  'APAGAR TUDO: clientes, histórico, dados do vendedor e pedido atual. (O catálogo de produtos NÃO é afetado por essa ação.) Continuar?'
                )
              ) {
                setClientes([]);
                setPedidos([]);
                setVendedor({ nome: '', telefone: '', email: '' });
                setPedidoAtual({
                  id: uid(),
                  numero: '',
                  data: todayISO(),
                  clienteId: null,
                  items: [],
                  obs: '',
                });
              }
            }}
            className="text-xs text-red-600 hover:bg-red-50 py-1.5 px-2 rounded-lg text-left"
          >
            Apagar todos os dados (clientes, histórico, vendedor)
          </button>
        </div>
      </div>
    </div>
  );
}

function CatalogUpdateCard() {
  const {
    products,
    catMeta,
    updateCatalog: onUpdate,
    resetCatalog: onReset,
  } = useCatalog();
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef(null);

  const stats = useMemo(() => {
    const byCat = {};
    products.forEach((p) => {
      byCat[p.categoria || 'OUTROS'] =
        (byCat[p.categoria || 'OUTROS'] || 0) + 1;
    });
    return { total: products.length, byCat };
  }, [products]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow same file to be re-selected later
    if (!file) return;
    setError('');
    setPreview(null);

    if (!file.name.match(/\.xlsx?$/i)) {
      setError('Arquivo precisa ser .xlsx ou .xls');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande (máximo 10MB).');
      return;
    }

    setParsing(true);
    try {
      const parsed = await parsePriceTable(file);
      const merged = mergeProducts(parsed, products);
      const novos = merged.filter((p) => p.status === 'NOVO');
      const removidos = products.filter(
        (c) => !merged.find((p) => p.codigo === c.codigo)
      );
      const atualizados = merged.filter((p) => {
        const old = products.find((c) => c.codigo === p.codigo);
        return (
          old &&
          (Math.abs(old.preco_st - p.preco_st) > 0.001 || old.un_cx !== p.un_cx)
        );
      });
      const semAlteracao = merged.length - novos.length - atualizados.length;
      setPreview({
        merged,
        novos,
        removidos,
        atualizados,
        semAlteracao,
        filename: file.name,
      });
    } catch (err) {
      setError(err.message || 'Erro ao processar o arquivo.');
    }
    setParsing(false);
  };

  const handleConfirm = async () => {
    if (!preview) return;
    await onUpdate(preview.merged, preview.filename);
    setPreview(null);
    setError('');
  };

  const handleReset = async () => {
    await onReset();
    setConfirmingReset(false);
    setFeedback('Tabela padrão restaurada.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const formatMetaDate = (iso) => {
    if (!iso) return null;
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
      <h3 className="font-semibold text-stone-900 text-sm mb-2">
        Catálogo de Produtos
      </h3>

      {/* Status atual */}
      <div className="text-xs text-stone-600 mb-3 space-y-1">
        <div>
          <strong>{stats.total} produtos</strong> cadastrados
        </div>
        {catMeta?.source === 'default' ? (
          <div className="text-stone-500">
            Usando tabela embutida (SPI-T2S4 2026.2 SP)
          </div>
        ) : (
          <div className="text-stone-500">
            Atualizada em {formatMetaDate(catMeta?.updatedAt) || '—'}
            {catMeta?.filename && <> · {catMeta.filename}</>}
          </div>
        )}
      </div>

      {/* Preview ou botão de upload */}
      {!preview ? (
        <>
          <input
            type="file"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
              className="w-full text-white font-medium text-sm py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: VC_GREEN }}
            >
              {parsing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Lendo arquivo...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Atualizar Tabela (.xlsx)
                </>
              )}
            </button>
            {catMeta?.source === 'upload' && !confirmingReset && (
              <button
                onClick={() => setConfirmingReset(true)}
                className="w-full text-xs text-stone-600 hover:text-stone-900 py-1.5 px-2"
              >
                Restaurar tabela padrão
              </button>
            )}
            {confirmingReset && (
              <div className="flex flex-col gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-xs text-amber-900">
                  <strong>Tem certeza?</strong> A tabela atual será substituída
                  pelos 89 produtos da tabela embutida (com EAN, SAP, peso e
                  imagens originais).
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingReset(false)}
                    className="flex-1 text-xs text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 py-1.5 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 text-xs font-semibold text-white py-1.5 rounded"
                    style={{ backgroundColor: VC_GREEN }}
                  >
                    Sim, restaurar
                  </button>
                </div>
              </div>
            )}
            {feedback && (
              <div
                className="text-xs py-1 px-2 rounded"
                style={{ backgroundColor: VC_GREEN_BG, color: VC_GREEN }}
              >
                ✓ {feedback}
              </div>
            )}
          </div>
          {error && (
            <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 whitespace-pre-line">
              <div className="flex items-start gap-1.5">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded-lg p-2">
            <FileCheck2 size={14} style={{ color: VC_GREEN }} />
            <span className="font-medium truncate">{preview.filename}</span>
          </div>

          <div className="text-xs space-y-1.5">
            <div className="flex justify-between border-b border-stone-200 pb-1">
              <span className="font-semibold text-stone-900">
                Total de produtos
              </span>
              <span className="font-bold" style={{ color: VC_GREEN }}>
                {preview.merged.length}
              </span>
            </div>
            {preview.novos.length > 0 && (
              <div className="flex justify-between text-blue-700">
                <span>🆕 Novos produtos</span>
                <span className="font-semibold">+{preview.novos.length}</span>
              </div>
            )}
            {preview.atualizados.length > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>📊 Preço/Un alterado</span>
                <span className="font-semibold">
                  {preview.atualizados.length}
                </span>
              </div>
            )}
            {preview.semAlteracao > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>✓ Sem alteração</span>
                <span className="font-semibold">{preview.semAlteracao}</span>
              </div>
            )}
            {preview.removidos.length > 0 && (
              <div className="flex justify-between text-red-700">
                <span>❌ Não estão na nova tabela</span>
                <span className="font-semibold">
                  −{preview.removidos.length}
                </span>
              </div>
            )}
          </div>

          {preview.removidos.length > 0 && (
            <div className="text-[10px] text-stone-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <div className="flex items-start gap-1">
                <AlertCircle
                  size={11}
                  className="mt-0.5 flex-shrink-0 text-amber-700"
                />
                <div>
                  <strong>Atenção:</strong> {preview.removidos.length} produto
                  {preview.removidos.length > 1 ? 's' : ''} que existe
                  {preview.removidos.length > 1 ? 'm' : ''} hoje no app não está
                  {preview.removidos.length > 1 ? 'ão' : ''} na nova tabela e
                  ser
                  {preview.removidos.length > 1 ? 'ão removidos' : 'á removido'}
                  . Verifique se está correto.
                </div>
              </div>
            </div>
          )}

          {preview.novos.length > 0 && (
            <details className="text-[10px] text-stone-600 bg-blue-50 border border-blue-200 rounded-lg p-2">
              <summary className="cursor-pointer font-semibold text-blue-700">
                Ver os {preview.novos.length} produtos novos
              </summary>
              <ul className="mt-2 space-y-0.5 max-h-32 overflow-y-auto">
                {preview.novos.map((p) => (
                  <li key={p.codigo}>
                    · {p.codigo} — {p.nome}
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-blue-800">
                Lançamentos não terão SAP, EAN, peso (queijos) e imagem
                cadastrados — esses dados podem ser adicionados depois.
              </div>
            </details>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setPreview(null)}
              className="flex-1 px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg"
              style={{ backgroundColor: VC_GREEN }}
            >
              Confirmar atualização
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BackupCard() {
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
