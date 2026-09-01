import { useState } from 'react';
import {
  ClipboardList,
  Download,
  X,
  ChevronRight,
  Gift,
} from 'lucide-react';
import { VC_GREEN, VC_GREEN_BG } from '../lib/constants.js';
import { formatBRL, formatDate } from '../lib/format.js';
import { findProduct } from '../lib/catalog.js';
import { calcItem } from '../lib/calc.js';
import { exportPedidoStyled } from '../lib/exportPedido.js';
import { useToast } from '../state/ToastContext.jsx';
import { Modal } from '../components/Modal.jsx';

// ============== PEDIDOS (HISTÓRICO) ==============
export function PedidosView({ pedidos, setPedidos, vendedor, onGerarBonificacao }) {
  const { confirm } = useToast();
  const [viewing, setViewing] = useState(null);

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <h2 className="text-xl font-semibold text-stone-900 mb-4 hidden md:block">
        Pedidos
      </h2>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <ClipboardList size={36} className="mx-auto text-stone-300 mb-2" />
          <p className="text-sm text-stone-500">
            Nenhum pedido finalizado ainda.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pedidos.map((p) => (
            <button
              key={p.id}
              onClick={() => setViewing(p)}
              className="w-full bg-white rounded-xl border border-stone-200 p-4 text-left hover:border-stone-300 transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {p.numero && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded"
                      style={{ backgroundColor: VC_GREEN_BG, color: VC_GREEN }}
                    >
                      Nº {p.numero}
                    </span>
                  )}
                  <span className="text-xs text-stone-500">
                    {formatDate(p.data)}
                  </span>
                </div>
                <div className="font-medium text-sm text-stone-900 truncate">
                  {p.clienteSnapshot?.razaoSocial || 'Cliente removido'}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {p.items.length} produtos
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-sm" style={{ color: VC_GREEN }}>
                  {formatBRL(p.total)}
                </div>
                <ChevronRight
                  size={16}
                  className="text-stone-400 ml-auto mt-1"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {viewing && (
        <PedidoDetailModal
          pedido={viewing}
          vendedor={vendedor}
          onClose={() => setViewing(null)}
          onGerarBonificacao={() => {
            onGerarBonificacao(viewing);
            setViewing(null);
          }}
          onDelete={async () => {
            if (
              await confirm('Excluir este pedido do histórico?', {
                confirmText: 'Excluir',
                danger: true,
              })
            ) {
              setPedidos(pedidos.filter((p) => p.id !== viewing.id));
              setViewing(null);
            }
          }}
        />
      )}
    </div>
  );
}

function PedidoDetailModal({
  pedido,
  vendedor,
  onClose,
  onDelete,
  onGerarBonificacao,
}) {
  const { notify } = useToast();
  return (
    <Modal
      onClose={onClose}
      ariaLabel={`Pedido ${pedido.numero || ''}`}
      className="w-full md:max-w-lg rounded-t-2xl md:rounded-xl max-h-[95vh] overflow-hidden flex flex-col"
    >
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <div>
            <h3 className="font-semibold text-stone-900">
              Pedido {pedido.numero ? `Nº ${pedido.numero}` : ''}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {formatDate(pedido.data)} · {pedido.clienteSnapshot?.razaoSocial}
            </p>
          </div>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 flex-1">
          <div className="space-y-2 mb-4">
            {pedido.items.map((item) => {
              const p = findProduct(item.codigo);
              const c = calcItem(item);
              return (
                <div
                  key={item.codigo}
                  className={`rounded-lg p-2.5 border ${
                    item.isExtra
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs text-stone-900">
                        {p?.nome || item.codigo}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {item.caixas} cx · {c.totalUn} un
                        {item.descPct > 0 ? ` · -${item.descPct}%` : ''}
                      </div>
                    </div>
                    <div className="font-semibold text-xs text-stone-900">
                      {formatBRL(c.vlTotal)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-stone-200 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span style={{ color: VC_GREEN }}>{formatBRL(pedido.total)}</span>
          </div>
          <button
            onClick={onGerarBonificacao}
            className="w-full mt-3 px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2 border"
            style={{ borderColor: VC_GREEN, color: VC_GREEN }}
          >
            <Gift size={14} />
            Gerar bonificação a partir deste pedido
          </button>
        </div>
        <div className="flex gap-2 p-4 border-t border-stone-200">
          <button
            onClick={onDelete}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
          >
            Excluir
          </button>
          <button
            onClick={() =>
              exportPedidoStyled(pedido, pedido.clienteSnapshot, vendedor).catch(
                () =>
                  notify('Não consegui gerar a planilha. Tente de novo.', {
                    type: 'error',
                  })
              )
            }
            className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: VC_GREEN }}
          >
            <Download size={14} />
            Baixar Planilha
          </button>
        </div>
    </Modal>
  );
}
