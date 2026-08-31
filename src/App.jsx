import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Users,
  Package,
  Settings,
  ClipboardList,
  Gift,
} from 'lucide-react';
import { VC_GREEN } from './lib/constants.js';
import { uid, todayISO } from './lib/format.js';
import { store } from './lib/storage.js';
import { DEFAULT_PRODUCTS } from './data/products.js';
import { setProducts } from './lib/catalog.js';
import { loadCustomImages } from './lib/images.js';
import { calcOrder } from './lib/calc.js';
import { exportPedidoStyled } from './lib/exportPedido.js';
import { NovoPedidoView } from './views/NovoPedidoView.jsx';
import { PedidosView } from './views/PedidosView.jsx';
import { ClientesView } from './views/ClientesView.jsx';
import { BonificacoesView } from './views/BonificacoesView.jsx';
import { CatalogoView } from './views/CatalogoView.jsx';
import { ConfigView } from './views/ConfigView.jsx';

// ============== MAIN APP ==============
export default function App() {
  const [tab, setTab] = useState('pedido');
  const [clientes, setClientes] = useState([]);
  const [vendedor, setVendedor] = useState({
    nome: '',
    telefone: '',
    email: '',
  });
  const [supervisor, setSupervisor] = useState('Estela');
  const [pedidoAtual, setPedidoAtual] = useState({
    id: uid(),
    numero: '',
    data: todayISO(),
    clienteId: null,
    items: [],
    obs: '',
  });
  const [pedidos, setPedidos] = useState([]);
  const [bonificacoes, setBonificacoes] = useState([]);
  const [bonifSeed, setBonifSeed] = useState(null); // pre-fill data when generating from a pedido
  const [loaded, setLoaded] = useState(false);
  const [catVersion, setCatVersion] = useState(0);
  const [catMeta, setCatMeta] = useState({
    source: 'default',
    updatedAt: null,
    filename: '',
  });

  useEffect(() => {
    (async () => {
      const storedCat = await store.get('catalogo');
      if (Array.isArray(storedCat) && storedCat.length > 0) {
        setProducts(storedCat);
      }
      const meta = await store.get('catalogo_meta', {
        source: 'default',
        updatedAt: null,
        filename: '',
      });
      setCatMeta(meta);
      await loadCustomImages();
      setClientes(await store.get('clientes', []));
      setVendedor(
        await store.get('vendedor', { nome: '', telefone: '', email: '' })
      );
      setSupervisor(await store.get('supervisor', 'Estela'));
      setPedidoAtual(
        await store.get('pedidoAtual', {
          id: uid(),
          numero: '',
          data: todayISO(),
          clienteId: null,
          items: [],
          obs: '',
        })
      );
      setPedidos(await store.get('pedidos', []));
      setBonificacoes(await store.get('bonificacoes', []));
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) store.set('clientes', clientes);
  }, [clientes, loaded]);
  useEffect(() => {
    if (loaded) store.set('vendedor', vendedor);
  }, [vendedor, loaded]);
  useEffect(() => {
    if (loaded) store.set('supervisor', supervisor);
  }, [supervisor, loaded]);
  useEffect(() => {
    if (loaded) store.set('pedidoAtual', pedidoAtual);
  }, [pedidoAtual, loaded]);
  useEffect(() => {
    if (loaded) store.set('pedidos', pedidos);
  }, [pedidos, loaded]);
  useEffect(() => {
    if (loaded) store.set('bonificacoes', bonificacoes);
  }, [bonificacoes, loaded]);

  const updateCatalog = async (newProducts, filename) => {
    setProducts(newProducts);
    const meta = {
      source: 'upload',
      updatedAt: new Date().toISOString(),
      filename: filename || '',
    };
    setCatMeta(meta);
    await store.set('catalogo', newProducts);
    await store.set('catalogo_meta', meta);
    setCatVersion((v) => v + 1);
  };

  const resetCatalog = async () => {
    setProducts([...DEFAULT_PRODUCTS]);
    const meta = { source: 'default', updatedAt: null, filename: '' };
    setCatMeta(meta);
    await store.delete('catalogo');
    await store.set('catalogo_meta', meta);
    setCatVersion((v) => v + 1);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-stone-500 text-sm">Carregando...</div>
      </div>
    );
  }

  const finalizarPedido = () => {
    if (!pedidoAtual.clienteId)
      return alert('Selecione um cliente antes de finalizar.');
    if (pedidoAtual.items.length === 0)
      return alert('Adicione ao menos um produto.');
    const cliente = clientes.find((c) => c.id === pedidoAtual.clienteId);
    const clienteSnapshot = cliente ? { ...cliente } : null;
    const { total } = calcOrder(pedidoAtual.items);
    const novo = {
      ...pedidoAtual,
      data: todayISO(),
      clienteSnapshot,
      total,
      finalizadoEm: new Date().toISOString(),
    };
    setPedidos([novo, ...pedidos]);
    exportPedidoStyled(novo, clienteSnapshot, vendedor);
    setPedidoAtual({
      id: uid(),
      numero: '',
      data: todayISO(),
      clienteId: null,
      items: [],
      obs: '',
    });
  };

  const apenasExportar = () => {
    if (!pedidoAtual.clienteId)
      return alert('Selecione um cliente antes de exportar.');
    if (pedidoAtual.items.length === 0)
      return alert('Adicione ao menos um produto.');
    const cliente = clientes.find((c) => c.id === pedidoAtual.clienteId);
    const pedidoComDataAtual = { ...pedidoAtual, data: todayISO() };
    exportPedidoStyled(pedidoComDataAtual, cliente, vendedor);
  };

  const gerarBonificacaoDePedido = (pedido) => {
    setBonifSeed({
      clienteId: pedido.clienteSnapshot
        ? clientes.find(
            (c) => c.razaoSocial === pedido.clienteSnapshot.razaoSocial
          )?.id || null
        : null,
      clienteSnapshot: pedido.clienteSnapshot,
      numeroPedido: pedido.numero || '',
      valorPedido: pedido.total ? pedido.total.toFixed(2) : '',
    });
    setTab('bonificacoes');
  };

  const navItems = [
    {
      id: 'pedido',
      label: 'Novo Pedido',
      mobileLabel: 'Pedido',
      icon: ShoppingCart,
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      mobileLabel: 'Histórico',
      icon: ClipboardList,
    },
    {
      id: 'bonificacoes',
      label: 'Bonificações',
      mobileLabel: 'Bonif.',
      icon: Gift,
    },
    { id: 'clientes', label: 'Clientes', mobileLabel: 'Clientes', icon: Users },
    {
      id: 'catalogo',
      label: 'Catálogo',
      mobileLabel: 'Catálogo',
      icon: Package,
    },
    { id: 'config', label: 'Ajustes', mobileLabel: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-50 md:flex">
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-stone-200 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: VC_GREEN }}
            >
              VC
            </div>
            <div>
              <div className="font-semibold text-stone-900 text-sm">
                Verde Campo
              </div>
              <div className="text-xs text-stone-500">Pedidos</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                tab === item.id
                  ? 'text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
              style={tab === item.id ? { backgroundColor: VC_GREEN } : {}}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 pb-20 md:pb-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: VC_GREEN }}
            >
              VC
            </div>
            <div className="font-semibold text-stone-900 text-sm">
              {navItems.find((n) => n.id === tab)?.label}
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto">
          {tab === 'pedido' && (
            <NovoPedidoView
              pedido={pedidoAtual}
              setPedido={setPedidoAtual}
              clientes={clientes}
              onFinalizar={finalizarPedido}
              onExportar={apenasExportar}
              catVersion={catVersion}
            />
          )}
          {tab === 'pedidos' && (
            <PedidosView
              pedidos={pedidos}
              setPedidos={setPedidos}
              vendedor={vendedor}
              onGerarBonificacao={gerarBonificacaoDePedido}
            />
          )}
          {tab === 'bonificacoes' && (
            <BonificacoesView
              bonificacoes={bonificacoes}
              setBonificacoes={setBonificacoes}
              clientes={clientes}
              vendedor={vendedor}
              supervisor={supervisor}
              seed={bonifSeed}
              clearSeed={() => setBonifSeed(null)}
              catVersion={catVersion}
            />
          )}
          {tab === 'clientes' && (
            <ClientesView clientes={clientes} setClientes={setClientes} />
          )}
          {tab === 'catalogo' && <CatalogoView catVersion={catVersion} />}
          {tab === 'config' && (
            <ConfigView
              vendedor={vendedor}
              setVendedor={setVendedor}
              supervisor={supervisor}
              setSupervisor={setSupervisor}
              setClientes={setClientes}
              setPedidos={setPedidos}
              setPedidoAtual={setPedidoAtual}
              catMeta={catMeta}
              onUpdateCatalog={updateCatalog}
              onResetCatalog={resetCatalog}
              catVersion={catVersion}
            />
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-20">
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2 px-0.5"
              style={
                tab === item.id ? { color: VC_GREEN } : { color: '#78716c' }
              }
            >
              <item.icon size={19} />
              <span className="text-[9px] font-medium leading-tight text-center">
                {item.mobileLabel || item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
