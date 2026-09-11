import { useEffect, useState } from 'react';
import { X, FileText, Copy, Pencil, Trash2 } from 'lucide-react';
import { VC_GREEN, VC_GREEN_BG } from '../lib/constants.js';
import { formatDate } from '../lib/format.js';
import {
  listarFichas,
  excluirFicha,
  paraFilial,
  rotuloFicha,
} from '../lib/fichasSalvas.js';
import { useToast } from '../state/ToastContext.jsx';
import { Modal } from './Modal.jsx';

/** Onde fica a unidade, para separar matriz de filial na lista. */
function ondeFica(form) {
  const partes = [form.municipio, form.estado].filter(Boolean);
  return partes.join(' - ');
}

export function FichasSalvasModal({ onAbrir, onClose }) {
  const { confirm } = useToast();
  const [fichas, setFichas] = useState(null);

  useEffect(() => {
    (async () => setFichas(await listarFichas()))();
  }, []);

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
              Toda ficha que você gerar fica guardada aqui.
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
        <button
          onClick={onClose}
          className="w-full px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
}
