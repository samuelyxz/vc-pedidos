import { useState, useMemo } from 'react';
import { Plus, Trash2, Search, Download, X } from 'lucide-react';
import { VC_GREEN, VC_GREEN_BG } from '../lib/constants.js';
import { formatBRL, todayISO } from '../lib/format.js';
import { findProduct } from '../lib/catalog.js';
import { calcBonifItem, calcBonifTotal } from '../lib/calc.js';
import { exportBonificacao } from '../lib/exportBonificacao.js';
import { useCatalog } from '../state/CatalogContext.jsx';
import { useToast } from '../state/ToastContext.jsx';
import { ProductImage } from './ProductImage.jsx';
import { Modal } from './Modal.jsx';

export function BonificacaoFormModal({
  bonif,
  clientes,
  vendedor,
  supervisor,
  onSave,
  onDelete,
  onCancel,
}) {
  const { products } = useCatalog();
  const { notify } = useToast();
  const [form, setForm] = useState({
    id: bonif.id,
    data: bonif.data || todayISO(),
    clienteId: bonif.clienteId || null,
    clienteSnapshot: bonif.clienteSnapshot || null,
    numeroPedido: bonif.numeroPedido || '',
    valorPedido: bonif.valorPedido || '',
    mediaRSL: bonif.mediaRSL || '',
    motivo: bonif.motivo || '',
    items: bonif.items || [],
  });
  const [addingProduct, setAddingProduct] = useState(false);
  const [search, setSearch] = useState('');

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const cliente =
    form.clienteSnapshot || clientes.find((c) => c.id === form.clienteId);
  const totalBonif = calcBonifTotal(form.items);
  const valorPedidoNum = parseFloat(form.valorPedido) || 0;

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return products;
    return products.filter(
      (p) =>
        p.nome.toLowerCase().includes(s) || p.codigo.toLowerCase().includes(s)
    );
  }, [search, products]);

  const addBonifItem = (codigo, qtd) => {
    const existing = form.items.findIndex((i) => i.codigo === codigo);
    if (existing >= 0) {
      const items = [...form.items];
      items[existing] = { codigo, qtd };
      update('items', items);
    } else {
      update('items', [...form.items, { codigo, qtd }]);
    }
    setAddingProduct(false);
    setSearch('');
  };

  const removeBonifItem = (codigo) => {
    update(
      'items',
      form.items.filter((i) => i.codigo !== codigo)
    );
  };

  const validar = () => {
    if (!cliente) {
      notify('Selecione um cliente.', { type: 'error' });
      return false;
    }
    if (form.items.length === 0) {
      notify('Adicione ao menos um produto.', { type: 'error' });
      return false;
    }
    if (!form.motivo.trim()) {
      notify('Preencha o motivo da bonificação.', { type: 'error' });
      return false;
    }
    return true;
  };

  const handleSalvar = () => {
    if (validar()) onSave(form);
  };

  const handleExportar = () => {
    if (!validar()) return;
    exportBonificacao(form, cliente, vendedor, supervisor).catch(() =>
      notify('Não consegui gerar a planilha. Tente de novo.', { type: 'error' })
    );
  };

  return (
    <Modal
      onClose={onCancel}
      ariaLabel={bonif.id ? 'Editar bonificação' : 'Nova bonificação'}
      className="w-full md:max-w-lg rounded-t-2xl md:rounded-xl max-h-[95vh] overflow-hidden flex flex-col"
    >
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h3 className="font-semibold text-stone-900">
            {bonif.id ? 'Editar Bonificação' : 'Nova Bonificação'}
          </h3>
          <button onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1 space-y-3">
          {/* Cliente */}
          <div>
            <label className="text-xs font-medium text-stone-600 mb-1 block">
              Cliente
            </label>
            <select
              value={form.clienteId || ''}
              onChange={(e) => {
                update('clienteId', e.target.value || null);
                update('clienteSnapshot', null);
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2"
            >
              <option value="">Selecionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nomeFantasia || c.razaoSocial}
                </option>
              ))}
            </select>
            {form.clienteSnapshot && !form.clienteId && (
              <p className="text-[10px] text-amber-600 mt-1">
                Cliente do pedido: {form.clienteSnapshot.razaoSocial}. Selecione
                acima para vincular ao cadastro atual.
              </p>
            )}
          </div>

          {/* Supervisor + Vendedor (read-only info) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">
                Supervisor
              </label>
              <div className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 text-stone-700">
                {supervisor || '—'}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">
                Vendedor
              </label>
              <div className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-stone-50 text-stone-700">
                {vendedor?.nome || '—'}
              </div>
            </div>
          </div>

          {/* Pedido info */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">
                Nº Pedido
              </label>
              <input
                type="text"
                value={form.numeroPedido}
                onChange={(e) => update('numeroPedido', e.target.value)}
                placeholder="39200"
                className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">
                Valor Pedido
              </label>
              <input
                type="number"
                step="0.01"
                value={form.valorPedido}
                onChange={(e) => update('valorPedido', e.target.value)}
                placeholder="0,00"
                className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">
                Média RSL
              </label>
              <input
                type="number"
                step="0.01"
                value={form.mediaRSL}
                onChange={(e) => update('mediaRSL', e.target.value)}
                placeholder="opcional"
                className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="text-xs font-medium text-stone-600 mb-1 block">
              Motivo da Bonificação *
            </label>
            <textarea
              value={form.motivo}
              onChange={(e) => update('motivo', e.target.value)}
              placeholder="Detalhe o máximo possível: campanha, degustação, recuperação de cliente, lançamento, etc."
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2"
            />
          </div>

          {/* Produtos bonificados */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-stone-600">
                Produtos Bonificados
              </label>
              <button
                onClick={() => setAddingProduct(true)}
                className="text-xs font-medium inline-flex items-center gap-1"
                style={{ color: VC_GREEN }}
              >
                <Plus size={12} /> Adicionar
              </button>
            </div>
            {form.items.length === 0 ? (
              <div className="text-center py-4 text-xs text-stone-400 border border-dashed border-stone-200 rounded-lg">
                Nenhum produto. Toque em Adicionar.
              </div>
            ) : (
              <div className="space-y-1.5">
                {form.items.map((item) => {
                  const p = findProduct(item.codigo);
                  if (!p) return null;
                  const c = calcBonifItem(item);
                  return (
                    <div
                      key={item.codigo}
                      className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-stone-900 truncate">
                          {p.nome}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {item.qtd} {c.unid} · {formatBRL(c.valor)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeBonifItem(item.codigo)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Totals */}
          <div
            className="rounded-lg p-3 space-y-1"
            style={{ backgroundColor: VC_GREEN_BG }}
          >
            <div
              className="flex justify-between text-sm font-bold"
              style={{ color: VC_GREEN }}
            >
              <span>Total Bonificação</span>
              <span>{formatBRL(totalBonif)}</span>
            </div>
            {valorPedidoNum > 0 && (
              <div className="flex justify-between text-xs text-stone-600">
                <span>Bonif vs Pedido</span>
                <span>{((totalBonif / valorPedidoNum) * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-stone-200">
          {bonif.id && (
            <button
              onClick={onDelete}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              Excluir
            </button>
          )}
          <button
            onClick={handleSalvar}
            className="flex-1 px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
          >
            Salvar
          </button>
          <button
            onClick={handleExportar}
            className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg flex items-center justify-center gap-1.5"
            style={{ backgroundColor: VC_GREEN }}
          >
            <Download size={14} /> Baixar
          </button>
        </div>

        {/* Add product sub-modal */}
        {addingProduct && (
          <div
            className="absolute inset-0 bg-white rounded-t-2xl md:rounded-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <h4 className="font-semibold text-stone-900 text-sm">
                Adicionar produto
              </h4>
              <button
                onClick={() => {
                  setAddingProduct(false);
                  setSearch('');
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-3 border-b border-stone-100">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1">
              {filtered.map((p) => (
                <BonifProductRow
                  key={p.codigo}
                  product={p}
                  onAdd={addBonifItem}
                  existing={form.items.find((i) => i.codigo === p.codigo)}
                />
              ))}
            </div>
          </div>
        )}
    </Modal>
  );
}

function BonifProductRow({ product: p, onAdd, existing }) {
  const [qtd, setQtd] = useState(existing?.qtd || 1);
  const isKg = p.unidade === 'KG' && p.peso_kg > 0;
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50">
      <ProductImage product={p} size={36} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-stone-900 truncate">
          {p.nome}
        </div>
        <div className="text-[10px] text-stone-500">
          {p.codigo} · {formatBRL(p.preco_st)}
          {isKg ? '/kg' : '/cx'}
        </div>
      </div>
      <input
        type="number"
        min="0"
        step={isKg ? '0.1' : '1'}
        value={qtd}
        onChange={(e) => setQtd(e.target.value)}
        className="w-16 px-2 py-1 border border-stone-300 rounded text-sm text-center focus:outline-none focus:ring-2"
      />
      <span className="text-[10px] text-stone-500 w-5">
        {isKg ? 'kg' : 'cx'}
      </span>
      <button
        onClick={() => onAdd(p.codigo, parseFloat(qtd) || 0)}
        disabled={!qtd || parseFloat(qtd) <= 0}
        className="px-2 py-1 text-xs font-semibold text-white rounded disabled:opacity-40"
        style={{ backgroundColor: VC_GREEN }}
      >
        {existing ? 'OK' : '+'}
      </button>
    </div>
  );
}
