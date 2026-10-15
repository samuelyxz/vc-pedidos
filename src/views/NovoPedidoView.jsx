import { Download, AlertCircle } from 'lucide-react';
import { VC_GREEN } from '../lib/constants.js';
import { MontagemProdutos } from '../components/MontagemProdutos.jsx';

// ============== NOVO PEDIDO ==============
export function NovoPedidoView({
  pedido,
  setPedido,
  clientes,
  onFinalizar,
  onExportar,
}) {
  const cliente = clientes.find((c) => c.id === pedido.clienteId);
  const pronto = !!cliente && pedido.items.length > 0;

  const cabecalho = (
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
            Nenhum cliente cadastrado ainda. Vai em <strong>Clientes</strong> e
            cadastra antes de montar um pedido.
          </span>
        </div>
      )}
    </div>
  );

  return (
    <MontagemProdutos
      pedido={pedido}
      setPedido={setPedido}
      cabecalho={cabecalho}
      acoes={(fechar) => (
        <>
          <button
            onClick={() => {
              fechar();
              onFinalizar();
            }}
            disabled={!pronto}
            className="w-full text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: VC_GREEN }}
          >
            <Download size={16} />
            Finalizar e Baixar
          </button>
          <button
            onClick={() => {
              fechar();
              onExportar();
            }}
            disabled={!pronto}
            className="w-full mt-2 text-xs text-stone-600 hover:text-stone-900 py-1.5 disabled:opacity-50"
          >
            Baixar sem finalizar
          </button>
        </>
      )}
    />
  );
}
