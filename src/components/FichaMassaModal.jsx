import { useEffect, useState } from 'react';
import { X, Download, RefreshCw, Users, AlertCircle } from 'lucide-react';
import { VC_GREEN, VC_GREEN_BG } from '../lib/constants.js';
import { listarFichas, rotuloFicha } from '../lib/fichasSalvas.js';
import {
  exportarFichaMassa,
  baixarFichaMassaEmBranco,
  MAX_CLIENTES,
} from '../lib/fichaMassa.js';
import { useToast } from '../state/ToastContext.jsx';
import { Modal } from './Modal.jsx';

const ondeFica = (form) =>
  [form.municipio, form.estado].filter(Boolean).join(' - ');

export function FichaMassaModal({ onClose }) {
  const { notify, confirm } = useToast();
  const [fichas, setFichas] = useState(null);
  // guardamos a ordem de seleção: o primeiro marcado vira o primeiro da lista
  const [escolhidos, setEscolhidos] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => setFichas(await listarFichas()))();
  }, []);

  const alternar = (id) =>
    setEscolhidos((atual) =>
      atual.includes(id)
        ? atual.filter((x) => x !== id)
        : atual.length >= MAX_CLIENTES
          ? atual
          : [...atual, id]
    );

  const gerar = async () => {
    const selecionadas = escolhidos
      .map((id) => fichas.find((f) => f.id === id))
      .filter(Boolean);
    if (!selecionadas.length) {
      notify('Marque pelo menos um cliente.', { type: 'error' });
      return;
    }
    if (selecionadas.length < 3) {
      const ok = await confirm(
        'A Verde Campo pede a ficha em massa só para 3 ou mais clientes da mesma rede. Com menos que isso, o certo é mandar uma ficha individual para cada. Gerar em massa mesmo assim?',
        { confirmText: 'Gerar em massa', cancelText: 'Voltar' }
      );
      if (!ok) return;
    }
    setBusy(true);
    try {
      await exportarFichaMassa(selecionadas.map((f) => f.form));
      notify(`Ficha em massa gerada com ${selecionadas.length} clientes.`);
    } catch {
      notify('Erro ao gerar a ficha em massa.', { type: 'error' });
    }
    setBusy(false);
  };

  return (
    <Modal
      onClose={onClose}
      ariaLabel="Ficha de cadastro em massa"
      className="w-full md:max-w-xl rounded-t-2xl md:rounded-xl max-h-[85vh] overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-stone-200">
        <h3 className="font-semibold text-stone-900">Ficha em massa</h3>
        <button onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto p-4 flex-1">
        <p className="text-xs text-stone-500 mb-3">
          Marque os clientes que vão na mesma planilha, na ordem em que devem
          aparecer. Cabem {MAX_CLIENTES}.
        </p>

        {fichas === null ? null : fichas.length === 0 ? (
          <div className="text-center py-8">
            <Users size={36} className="mx-auto text-stone-300 mb-2" />
            <p className="text-sm text-stone-500">
              Nenhuma ficha gerada ainda.
            </p>
            <p className="text-xs text-stone-400 mt-1">
              A ficha em massa aproveita as fichas individuais que você já fez.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {fichas.map((f) => {
              const posicao = escolhidos.indexOf(f.id);
              const marcado = posicao !== -1;
              return (
                <li key={f.id}>
                  <label
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${
                      marcado ? 'bg-stone-50' : 'border-stone-200'
                    }`}
                    style={marcado ? { borderColor: VC_GREEN } : {}}
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={() => alternar(f.id)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-medium text-sm text-stone-900 truncate">
                          {rotuloFicha(f.form)}
                        </span>
                        {marcado && (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{
                              backgroundColor: VC_GREEN_BG,
                              color: VC_GREEN,
                            }}
                          >
                            {posicao + 1}º
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-stone-500 mt-0.5">
                        {[ondeFica(f.form), f.form.cnpj]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4 text-[11px] text-stone-600 bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-start gap-1.5">
          <AlertCircle
            size={13}
            className="text-amber-700 mt-0.5 flex-shrink-0"
          />
          <span>
            O modelo da Verde Campo só monta a aba de importação do primeiro
            cliente. O app completa as linhas seguintes com os mesmos valores
            que as fórmulas dela produziriam, senão os demais chegariam sem
            CNPJ, razão social e banco.
          </span>
        </div>
      </div>

      <div className="p-4 border-t border-stone-200 flex gap-2">
        <button
          onClick={onClose}
          className="px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
        >
          Fechar
        </button>
        <button
          onClick={baixarFichaMassaEmBranco}
          className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg border border-stone-300"
        >
          Em branco
        </button>
        <button
          onClick={gerar}
          disabled={busy || escolhidos.length === 0}
          className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: VC_GREEN }}
        >
          {busy ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          {busy
            ? 'Gerando...'
            : `Gerar com ${escolhidos.length} ${
                escolhidos.length === 1 ? 'cliente' : 'clientes'
              }`}
        </button>
      </div>
    </Modal>
  );
}
