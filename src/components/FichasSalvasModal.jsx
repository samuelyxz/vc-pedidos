import { useEffect, useRef, useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Pencil,
  Trash2,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { VC_GREEN, VC_GREEN_BG } from '../lib/constants.js';
import { formatDate } from '../lib/format.js';
import {
  listarFichas,
  excluirFicha,
  salvarFicha,
  paraFilial,
  rotuloFicha,
} from '../lib/fichasSalvas.js';
import { lerFichaDeArquivo } from '../lib/fichaImport.js';
import { useToast } from '../state/ToastContext.jsx';
import { Modal } from './Modal.jsx';

/** Onde fica a unidade, para separar matriz de filial na lista. */
function ondeFica(form) {
  const partes = [form.municipio, form.estado].filter(Boolean);
  return partes.join(' - ');
}

export function FichasSalvasModal({ onAbrir, onClose }) {
  const { confirm, notify } = useToast();
  const [fichas, setFichas] = useState(null);
  const [importando, setImportando] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => setFichas(await listarFichas()))();
  }, []);

  // Fichas geradas antes de existir o histórico (ou em outro computador) não
  // estão aqui. Em vez de redigitar, lemos o .xlsb de volta.
  const importar = async (e) => {
    const arquivos = [...(e.target.files || [])];
    e.target.value = '';
    if (!arquivos.length) return;

    setImportando(true);
    const erros = [];
    let importadas = 0;
    for (const arquivo of arquivos) {
      try {
        await salvarFicha(await lerFichaDeArquivo(arquivo));
        importadas++;
      } catch (err) {
        erros.push(`${arquivo.name}: ${err.message}`);
      }
    }
    setFichas(await listarFichas());
    setImportando(false);

    if (importadas) {
      notify(
        `${importadas} ${importadas === 1 ? 'ficha importada' : 'fichas importadas'}.`
      );
    }
    for (const erro of erros) notify(erro, { type: 'error', duration: 7000 });
  };

  const apagar = async (ficha) => {
    const ok = await confirm(
      `Excluir a ficha de ${rotuloFicha(ficha.form)} do histórico? O arquivo que você já baixou continua onde está.`,
      { confirmText: 'Excluir', danger: true }
    );
    if (!ok) return;
    await excluirFicha(ficha.id);
    setFichas(await listarFichas());
  };

  return (
    <Modal
      onClose={onClose}
      ariaLabel="Fichas cadastrais geradas"
      className="w-full md:max-w-xl rounded-t-2xl md:rounded-xl max-h-[85vh] overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-stone-200">
        <h3 className="font-semibold text-stone-900">Fichas geradas</h3>
        <button onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto p-4 flex-1">
        {fichas === null ? null : fichas.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={36} className="mx-auto text-stone-300 mb-2" />
            <p className="text-sm text-stone-500">
              Nenhuma ficha gerada ainda.
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Toda ficha que você gerar fica guardada aqui. Já tem fichas
              baixadas? Use &quot;Importar ficha já gerada&quot; abaixo.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {fichas.map((f) => (
              <li
                key={f.id}
                className="bg-white rounded-xl border border-stone-200 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-stone-900 truncate">
                        {rotuloFicha(f.form)}
                      </span>
                      {f.form.filial === 'S' && (
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{
                            backgroundColor: VC_GREEN_BG,
                            color: VC_GREEN,
                          }}
                        >
                          FILIAL
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5 space-y-0.5">
                      {ondeFica(f.form) && <div>{ondeFica(f.form)}</div>}
                      {f.form.cnpj && <div>CNPJ: {f.form.cnpj}</div>}
                      <div className="text-stone-400">
                        Gerada em {formatDate(f.atualizadoEm?.slice(0, 10))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => apagar(f)}
                    aria-label={`Excluir ficha de ${rotuloFicha(f.form)}`}
                    className="text-stone-400 hover:text-red-600 p-1 flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onAbrir({ form: f.form, id: f.id })}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5"
                    style={{ borderColor: VC_GREEN, color: VC_GREEN }}
                  >
                    <Pencil size={13} />
                    Abrir e conferir
                  </button>
                  <button
                    onClick={() => onAbrir({ form: paraFilial(f.form) })}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 flex items-center gap-1.5"
                  >
                    <Copy size={13} />
                    Duplicar para filial
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-stone-200">
        <p className="text-[11px] text-stone-500 mb-2">
          &quot;Duplicar para filial&quot; mantém empresa, banco, representante
          e tabela, e limpa CNPJ, inscrição estadual, endereço e nome
          abreviado — que mudam em cada unidade.
        </p>
        <input
          type="file"
          accept=".xlsb,application/vnd.ms-excel.sheet.binary.macroEnabled.12"
          multiple
          ref={inputRef}
          onChange={importar}
          style={{ display: 'none' }}
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
          >
            Fechar
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={importando}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border flex items-center justify-center gap-1.5 disabled:opacity-50"
            style={{ borderColor: VC_GREEN, color: VC_GREEN }}
          >
            {importando ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            {importando ? 'Importando...' : 'Importar ficha já gerada'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
