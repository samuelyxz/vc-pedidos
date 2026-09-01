import { useState, useEffect } from 'react';
import { Plus, Gift, ChevronRight } from 'lucide-react';
import { VC_GREEN, VC_GREEN_BG } from '../lib/constants.js';
import { uid, formatBRL, formatDate, todayISO } from '../lib/format.js';
import { calcBonifTotal } from '../lib/calc.js';
import { useToast } from '../state/ToastContext.jsx';
import { BonificacaoFormModal } from '../components/BonificacaoFormModal.jsx';

function bonifFromSeed(seed) {
  return {
    id: null,
    data: todayISO(),
    clienteId: seed.clienteId || null,
    clienteSnapshot: seed.clienteSnapshot || null,
    numeroPedido: seed.numeroPedido || '',
    valorPedido: seed.valorPedido || '',
    mediaRSL: '',
    motivo: '',
    items: [],
  };
}

// ============== BONIFICAÇÕES ==============
export function BonificacoesView({
  bonificacoes,
  setBonificacoes,
  clientes,
  vendedor,
  supervisor,
  initialSeed,
  onConsumeSeed,
}) {
  const { confirm } = useToast();
  // Se chegou com um seed (gerado a partir de um pedido), já abre o form
  // preenchido. O initializer roda a cada vez que a aba é aberta (o componente
  // remonta na troca de aba).
  const [editing, setEditing] = useState(() =>
    initialSeed ? bonifFromSeed(initialSeed) : null
  );

  useEffect(() => {
    if (initialSeed) onConsumeSeed();
  }, [initialSeed, onConsumeSeed]);

  const salvar = (bonif) => {
    if (bonif.id) {
      setBonificacoes(bonificacoes.map((b) => (b.id === bonif.id ? bonif : b)));
    } else {
      setBonificacoes([
        { ...bonif, id: uid(), criadoEm: new Date().toISOString() },
        ...bonificacoes,
      ]);
    }
    setEditing(null);
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-stone-900 hidden md:block">
          Bonificações
        </h2>
        <button
          onClick={() =>
            setEditing({
              id: null,
              data: todayISO(),
              clienteId: null,
              numeroPedido: '',
              valorPedido: '',
              mediaRSL: '',
              motivo: '',
              items: [],
            })
          }
          className="ml-auto inline-flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg"
          style={{ backgroundColor: VC_GREEN }}
        >
          <Plus size={16} />
          Nova Bonificação
        </button>
      </div>

      {bonificacoes.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <Gift size={36} className="mx-auto text-stone-300 mb-2" />
          <p className="text-sm text-stone-500">
            Nenhuma bonificação registrada.
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Crie uma nova ou gere a partir de um pedido no histórico.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bonificacoes.map((b) => {
            const totalB = calcBonifTotal(b.items || []);
            const cli =
              b.clienteSnapshot || clientes.find((c) => c.id === b.clienteId);
            return (
              <button
                key={b.id}
                onClick={() => setEditing(b)}
                className="w-full bg-white rounded-xl border border-stone-200 p-4 text-left hover:border-stone-300 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {b.numeroPedido && (
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: VC_GREEN_BG,
                          color: VC_GREEN,
                        }}
                      >
                        Ped. {b.numeroPedido}
                      </span>
                    )}
                    <span className="text-xs text-stone-500">
                      {formatDate(b.data)}
                    </span>
                  </div>
                  <div className="font-medium text-sm text-stone-900 truncate">
                    {cli?.nomeFantasia || cli?.razaoSocial || 'Cliente'}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5 truncate">
                    {(b.items || []).length} produto(s)
                    {b.motivo ? ` · ${b.motivo.slice(0, 40)}` : ''}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className="font-bold text-sm"
                    style={{ color: VC_GREEN }}
                  >
                    {formatBRL(totalB)}
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-stone-400 ml-auto mt-1"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {editing && (
        <BonificacaoFormModal
          bonif={editing}
          clientes={clientes}
          vendedor={vendedor}
          supervisor={supervisor}
          onSave={salvar}
          onDelete={async () => {
            if (
              await confirm('Excluir esta bonificação?', {
                confirmText: 'Excluir',
                danger: true,
              })
            ) {
              setBonificacoes(bonificacoes.filter((b) => b.id !== editing.id));
              setEditing(null);
            }
          }}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
