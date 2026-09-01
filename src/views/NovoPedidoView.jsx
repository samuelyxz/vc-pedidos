import { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Search, X, AlertCircle } from 'lucide-react';
import {
  VC_GREEN,
  VC_GREEN_BG,
  CAT_ICONS,
  CAT_ORDER,
} from '../lib/constants.js';
import { formatBRL } from '../lib/format.js';
import { calcOrder } from '../lib/calc.js';
import { useCatalog } from '../state/CatalogContext.jsx';
import { ProductImage } from '../components/ProductImage.jsx';
import { ProductModal } from '../components/ProductModal.jsx';
import { CartPanel } from '../components/CartPanel.jsx';

// ============== NOVO PEDIDO ==============
export function NovoPedidoView({
  pedido,
  setPedido,
  clientes,
  onFinalizar,
  onExportar,
}) {
  const { products } = useCatalog();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showOnlyOrdered, setShowOnlyOrdered] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [addingProduct, setAddingProduct] = useState(null);

  const cliente = clientes.find((c) => c.id === pedido.clienteId);
  const { total, totalCaixas } = calcOrder(pedido.items);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return products.filter((p) => {
      if (catFilter !== 'all' && p.categoria !== catFilter) return false;
      if (showOnlyOrdered && !pedido.items.find((i) => i.codigo === p.codigo))
        return false;
      if (!s) return true;
      return (
        p.nome.toLowerCase().includes(s) ||
        p.codigo.toLowerCase().includes(s) ||
        (p.sap && p.sap.includes(s)) ||
        p.subcategoria.toLowerCase().includes(s)
      );
    });
  }, [search, catFilter, showOnlyOrdered, pedido.items, products]);

  const addItem = (codigo, caixas, bonif, descPct, isExtra, obs) => {
    const existing = pedido.items.findIndex((i) => i.codigo === codigo);
    const newItem = { codigo, caixas, bonif, descPct, isExtra, obs: obs || '' };
    if (existing >= 0) {
      const items = [...pedido.items];
      items[existing] = newItem;
      setPedido({ ...pedido, items });
    } else {
      setPedido({ ...pedido, items: [...pedido.items, newItem] });
    }
    setAddingProduct(null);
  };

  const removeItem = (codigo) => {
    setPedido({
      ...pedido,
      items: pedido.items.filter((i) => i.codigo !== codigo),
    });
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-stone-600 mb-1 block">
              Cliente
            </label>
            <select
              value={pedido.clienteId || ''}
              onChange={(e) =>
                setPedido({ ...pedido, clienteId: e.target.value || null })
              }
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2"
            >
              <option value="">Selecionar cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razaoSocial}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-600 mb-1 block">
              Nº do Pedido
            </label>
            <input
              type="text"
              value={pedido.numero}
              onChange={(e) => setPedido({ ...pedido, numero: e.target.value })}
              placeholder="Ex: 39200"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
            />
          </div>
        </div>
        {clientes.length === 0 && (
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              Nenhum cliente cadastrado ainda. Vai em <strong>Clientes</strong>{' '}
              e cadastra antes de montar um pedido.
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, código TOTVS, SAP..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setCatFilter('all');
              setShowOnlyOrdered(false);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              catFilter === 'all' && !showOnlyOrdered
                ? 'text-white'
                : 'bg-stone-100 text-stone-700'
            }`}
            style={
              catFilter === 'all' && !showOnlyOrdered
                ? { backgroundColor: VC_GREEN }
                : {}
            }
          >
            Todos
          </button>
          {pedido.items.length > 0 && (
            <button
              onClick={() => {
                setShowOnlyOrdered(!showOnlyOrdered);
                setCatFilter('all');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                showOnlyOrdered ? 'text-white' : 'bg-stone-100 text-stone-700'
              }`}
              style={showOnlyOrdered ? { backgroundColor: VC_GREEN } : {}}
            >
              ✓ No Pedido ({pedido.items.length})
            </button>
          )}
          {CAT_ORDER.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCatFilter(cat);
                setShowOnlyOrdered(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                catFilter === cat ? 'text-white' : 'bg-stone-100 text-stone-700'
              }`}
              style={catFilter === cat ? { backgroundColor: VC_GREEN } : {}}
            >
              {CAT_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-stone-500 bg-white rounded-xl border border-stone-200">
              Nenhum produto encontrado.
            </div>
          )}
          {filtered.map((p) => {
            const inCart = pedido.items.find((i) => i.codigo === p.codigo);
            const isExtra = inCart?.isExtra;
            return (
              <button
                key={p.codigo}
                onClick={() => setAddingProduct(p)}
                className="w-full bg-white rounded-xl border border-stone-200 p-3 text-left hover:border-stone-300 transition-colors flex items-center gap-3"
              >
                <ProductImage product={p} size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-stone-900 text-sm leading-tight">
                      {p.nome}
                    </span>
                    {p.status && (
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          p.status.toLowerCase().includes('lan')
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {p.status.toLowerCase().includes('lan')
                          ? 'LANÇ.'
                          : 'DESCONT.'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5 flex flex-wrap gap-x-2">
                    <span>{p.codigo}</span>
                    <span>·</span>
                    <span>
                      {p.un_cx} un/cx
                      {p.unidade === 'KG' && p.peso_kg
                        ? ` (${p.peso_kg.toString().replace('.', ',')}kg)`
                        : ''}
                    </span>
                    <span>·</span>
                    <span className="font-medium text-stone-700">
                      {formatBRL(p.preco_st)}
                      {p.unidade === 'KG' ? '/kg' : ''}
                    </span>
                  </div>
                </div>
                {inCart ? (
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-md ${
                      isExtra ? 'bg-amber-100 text-amber-800' : ''
                    }`}
                    style={
                      !isExtra
                        ? { backgroundColor: VC_GREEN_BG, color: VC_GREEN }
                        : {}
                    }
                  >
                    {inCart.caixas} cx
                  </div>
                ) : (
                  <Plus size={18} className="text-stone-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:block">
          <CartPanel
            pedido={pedido}
            setPedido={setPedido}
            cliente={cliente}
            onRemove={removeItem}
            onEdit={setAddingProduct}
            onFinalizar={onFinalizar}
            onExportar={onExportar}
          />
        </div>
      </div>

      {pedido.items.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="md:hidden fixed bottom-20 left-4 right-4 text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-lg z-10"
          style={{ backgroundColor: VC_GREEN }}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <span className="font-medium text-sm">
              {pedido.items.length} item{pedido.items.length > 1 ? 's' : ''} ·{' '}
              {totalCaixas} cx
            </span>
          </div>
          <span className="font-bold">{formatBRL(total)}</span>
        </button>
      )}

      {showCart && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setShowCart(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <h3 className="font-semibold text-stone-900">Pedido</h3>
              <button onClick={() => setShowCart(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <CartPanel
                pedido={pedido}
                setPedido={setPedido}
                cliente={cliente}
                onRemove={removeItem}
                onEdit={(p) => {
                  setShowCart(false);
                  setAddingProduct(p);
                }}
                onFinalizar={() => {
                  setShowCart(false);
                  onFinalizar();
                }}
                onExportar={() => {
                  setShowCart(false);
                  onExportar();
                }}
                embedded
              />
            </div>
          </div>
        </div>
      )}

      {addingProduct && (
        <ProductModal
          product={addingProduct}
          existing={pedido.items.find((i) => i.codigo === addingProduct.codigo)}
          onSave={addItem}
          onCancel={() => setAddingProduct(null)}
          onRemove={() => {
            removeItem(addingProduct.codigo);
            setAddingProduct(null);
          }}
        />
      )}
    </div>
  );
}
