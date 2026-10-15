import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Download,
  Lightbulb,
  Plus,
  ShoppingCart,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { VC_GREEN, VC_GREEN_BG } from '../lib/constants.js';
import { formatBRL, formatDate } from '../lib/format.js';
import { calcOrder } from '../lib/calc.js';
import { exportSugestao } from '../lib/exportPedido.js';
import {
  listarSugestoes,
  salvarSugestao,
  excluirSugestao,
  duplicarSugestao,
  novaSugestao,
  rotuloSugestao,
  separarItens,
} from '../lib/sugestoes.js';
import { useToast } from '../state/ToastContext.jsx';
import { MontagemProdutos } from '../components/MontagemProdutos.jsx';

/** @typedef {import('../lib/sugestoes.js').Sugestao} Sugestao */

// ============== SUGESTÕES DE COMPRA ==============
// Mix de produtos para apresentar a cliente novo, sem cliente nem número de
// pedido. Fica salvo como modelo e vira pedido com um clique.
export function SugestoesView({ vendedor, onUsarNoPedido }) {
  const { notify, confirm } = useToast();
  /** @type {[Sugestao[] | null, Function]} */
  const [lista, setLista] = useState(null);
  /** @type {[Sugestao | null, Function]} */
  const [editando, setEditando] = useState(null);
  // ids já gravados nesta visita, para salvar também quando a sugestão é esvaziada
  const gravadas = useRef(new Set());

  useEffect(() => {
    (async () => setLista(await listarSugestoes()))();
  }, []);

  const recarregar = async () => setLista(await listarSugestoes());

  const baixar = (sugestao) => {
    const { validos } = separarItens(sugestao.items);
    if (!validos.length) {
      notify('Adicione ao menos um produto.', { type: 'error' });
      return;
    }
    exportSugestao({ ...sugestao, items: validos }, vendedor).catch(() =>
      notify('Não consegui gerar a planilha. Tente de novo.', { type: 'error' })
    );
  };

  const apagar = async (sugestao) => {
    const ok = await confirm(`Excluir a sugestão "${rotuloSugestao(sugestao)}"?`, {
      confirmText: 'Excluir',
      danger: true,
    });
    if (!ok) return;
    await excluirSugestao(sugestao.id);
    await recarregar();
  };

  const duplicar = async (sugestao) => {
    await duplicarSugestao(sugestao);
    await recarregar();
    notify('Cópia criada.');
  };

  // Salva a cada mudança: sair da tela nunca perde o que foi montado. Uma
  // sugestão nova só entra na lista quando ganha nome ou produto.
  const atualizar = (proxima) => {
    setEditando(proxima);
    const jaSalva =
      gravadas.current.has(proxima.id) ||
      lista?.some((s) => s.id === proxima.id);
    if (jaSalva || proxima.items.length || proxima.nome.trim()) {
      gravadas.current.add(proxima.id);
      salvarSugestao(proxima);
    }
  };

  const voltar = async () => {
    setEditando(null);
    await recarregar();
  };

  if (editando) {
    return (
      <MontagemProdutos
        pedido={editando}
        setPedido={atualizar}
        titulo="Sugestão em montagem"
        textoLimpar="Tirar todos os produtos da sugestão?"
        rotuloEscolhidos="Na sugestão"
        tituloCurto="Sugestão"
        permitirSugestao={false}
        cabecalho={
          <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
            <button
              onClick={voltar}
              className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 mb-3"
            >
              <ArrowLeft size={14} />
              Sugestões salvas
            </button>
            <label
              htmlFor="sugestao-nome"
              className="text-xs font-medium text-stone-600 mb-1 block"
            >
              Nome da sugestão
            </label>
            <input
              id="sugestao-nome"
              type="text"
              value={editando.nome}
              onChange={(e) => atualizar({ ...editando, nome: e.target.value })}
              placeholder="Ex: Mix inicial mercado pequeno"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
            />
            <div className="text-[11px] text-stone-500 mt-1.5">
              Salva automaticamente. Só para você — o nome não sai na planilha.
            </div>
          </div>
        }
        acoes={(fechar) => (
          <>
            <button
              onClick={() => {
                fechar();
                baixar(editando);
              }}
              className="w-full text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2"
              style={{ backgroundColor: VC_GREEN }}
            >
              <Download size={16} />
              Baixar planilha
            </button>
            <button
              onClick={() => {
                fechar();
                onUsarNoPedido(editando);
              }}
              className="w-full mt-2 text-xs text-stone-600 hover:text-stone-900 py-1.5 flex items-center justify-center gap-1.5"
            >
              <ShoppingCart size={13} />
              Usar no pedido
            </button>
          </>
        )}
      />
    );
  }

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-stone-900">Sugestões de compra</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Monte um mix para cliente novo, sem precisar de cadastro. Os
            preços são sempre os da tabela atual.
          </p>
        </div>
        <button
          onClick={() => setEditando(novaSugestao())}
          className="flex-shrink-0 text-white text-sm font-medium px-3 py-2 rounded-lg flex items-center gap-1.5"
          style={{ backgroundColor: VC_GREEN }}
        >
          <Plus size={16} />
          Nova
        </button>
      </div>

      {lista === null ? (
        <div className="text-center py-12 text-sm text-stone-500">
          Carregando...
        </div>
      ) : lista.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-xl border border-stone-200">
          <Lightbulb size={28} className="mx-auto text-stone-300 mb-2" />
          <div className="text-sm text-stone-700 font-medium">
            Nenhuma sugestão salva ainda
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Toque em <strong>Nova</strong> e escolha os produtos.
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {lista.map((s) => (
            <CartaoSugestao
              key={s.id}
              sugestao={s}
              onAbrir={() => setEditando(s)}
              onBaixar={() => baixar(s)}
              onUsar={() => onUsarNoPedido(s)}
              onDuplicar={() => duplicar(s)}
              onExcluir={() => apagar(s)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CartaoSugestao({
  sugestao,
  onAbrir,
  onBaixar,
  onUsar,
  onDuplicar,
  onExcluir,
}) {
  const { validos, fora } = separarItens(sugestao.items);
  const { total, totalCaixas } = calcOrder(validos);
  const nome = rotuloSugestao(sugestao);

  const acao =
    'p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100';

  return (
    <li className="bg-white rounded-xl border border-stone-200 p-3">
      <div className="flex items-start gap-3">
        <button onClick={onAbrir} className="flex-1 min-w-0 text-left">
          <div className="font-medium text-sm text-stone-900 truncate">
            {nome}
          </div>
          <div className="text-xs text-stone-500 mt-0.5">
            {validos.length} produto{validos.length !== 1 ? 's' : ''} ·{' '}
            {totalCaixas} cx ·{' '}
            <span className="font-semibold" style={{ color: VC_GREEN }}>
              {formatBRL(total)}
            </span>
          </div>
          <div className="text-[11px] text-stone-400 mt-0.5">
            Atualizada em {formatDate(sugestao.atualizadoEm.slice(0, 10))}
          </div>
        </button>
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={onBaixar}
            className={acao}
            aria-label={`Baixar planilha de ${nome}`}
            title="Baixar planilha"
          >
            <Download size={16} />
          </button>
          <button
            onClick={onUsar}
            className={acao}
            aria-label={`Usar ${nome} no pedido`}
            title="Usar no pedido"
          >
            <ShoppingCart size={16} />
          </button>
          <button
            onClick={onDuplicar}
            className={acao}
            aria-label={`Duplicar ${nome}`}
            title="Duplicar"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onExcluir}
            className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
            aria-label={`Excluir ${nome}`}
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {fora.length > 0 && (
        <div
          className="mt-2 flex items-start gap-1.5 text-[11px] rounded-lg px-2 py-1.5 bg-amber-50 text-amber-800"
        >
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
          <span>
            {fora.length} produto{fora.length !== 1 ? 's saíram' : ' saiu'} da
            tabela atual e {fora.length !== 1 ? 'ficam' : 'fica'} de fora da
            planilha e do pedido.
          </span>
        </div>
      )}
      {validos.length === 0 && fora.length === 0 && (
        <div
          className="mt-2 text-[11px] rounded-lg px-2 py-1.5"
          style={{ backgroundColor: VC_GREEN_BG, color: VC_GREEN }}
        >
          Ainda sem produtos. Toque no nome para montar.
        </div>
      )}
    </li>
  );
}
