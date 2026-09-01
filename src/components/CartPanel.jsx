import { Trash2, Download } from 'lucide-react';
import { VC_GREEN } from '../lib/constants.js';
import { formatBRL } from '../lib/format.js';
import { findProduct } from '../lib/catalog.js';
import { calcItem, calcOrder } from '../lib/calc.js';
import { useToast } from '../state/ToastContext.jsx';
import { ProductImage } from './ProductImage.jsx';

export function CartPanel({
  pedido,
  setPedido,
  cliente,
  onRemove,
  onEdit,
  onFinalizar,
  onExportar,
  embedded = false,
}) {
  const { confirm } = useToast();
  const { total, totalCaixas, totalBonif } = calcOrder(pedido.items);
  return (
    <div
      className={`${
        embedded
          ? 'p-4'
          : 'bg-white rounded-xl border border-stone-200 p-4 sticky top-4'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-stone-900 text-sm">
          Pedido em montagem
        </h3>
        {pedido.items.length > 0 && (
          <button
            onClick={async () => {
              if (await confirm('Limpar o pedido atual?', { danger: true }))
                setPedido({ ...pedido, items: [] });
            }}
            className="text-xs text-stone-500 hover:text-red-600"
          >
            Limpar
          </button>
        )}
      </div>

      {pedido.items.length === 0 ? (
        <div className="text-center py-8 text-xs text-stone-500">
          Selecione produtos para começar.
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {pedido.items.map((item) => {
              const p = findProduct(item.codigo);
              if (!p) return null;
              const c = calcItem(item);
              return (
                <div
                  key={item.codigo}
                  className={`rounded-lg p-2 border ${
                    item.isExtra
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <ProductImage product={p} size={36} />
                    <button
                      onClick={() => onEdit(p)}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="font-medium text-xs text-stone-900 leading-tight">
                        {p.nome}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {item.caixas} cx · {c.totalUn} un
                        {item.descPct > 0 ? ` · -${item.descPct}%` : ''}
                        {item.bonif > 0 ? ` · ${item.bonif} bonif` : ''}
                      </div>
                    </button>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-xs text-stone-900">
                        {formatBRL(c.vlTotal)}
                      </div>
                      <button
                        onClick={() => onRemove(item.codigo)}
                        className="text-red-500 hover:text-red-700 mt-1"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-stone-200 pt-3 space-y-1 mb-4">
            <div className="flex justify-between text-xs text-stone-600">
              <span>Total caixas</span>
              <span>{totalCaixas}</span>
            </div>
            {totalBonif > 0 && (
              <div className="flex justify-between text-xs text-stone-600">
                <span>Bonificação</span>
                <span>{totalBonif}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-stone-900 pt-1">
              <span className="text-sm">Total</span>
              <span className="text-base" style={{ color: VC_GREEN }}>
                {formatBRL(total)}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <label className="text-xs font-medium text-stone-600 block">
              Observações
            </label>
            <textarea
              value={pedido.obs}
              onChange={(e) => setPedido({ ...pedido, obs: e.target.value })}
              placeholder="Frete, prazo, observações..."
              rows={2}
              className="w-full px-2 py-1.5 border border-stone-300 rounded-lg text-xs resize-none focus:outline-none focus:ring-2"
            />
          </div>

          <button
            onClick={onFinalizar}
            disabled={!cliente || pedido.items.length === 0}
            className="w-full text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: VC_GREEN }}
          >
            <Download size={16} />
            Finalizar e Baixar
          </button>
          <button
            onClick={onExportar}
            disabled={!cliente || pedido.items.length === 0}
            className="w-full mt-2 text-xs text-stone-600 hover:text-stone-900 py-1.5 disabled:opacity-50"
          >
            Baixar sem finalizar
          </button>
        </>
      )}
    </div>
  );
}
