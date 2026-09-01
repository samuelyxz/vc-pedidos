import { uid, todayISO } from '../lib/format.js';
import { Field } from '../components/Field.jsx';
import { CatalogUpdateCard } from '../components/CatalogUpdateCard.jsx';
import { BackupCard } from '../components/BackupCard.jsx';

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
