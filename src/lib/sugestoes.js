import { store } from './storage.js';
import { uid } from './format.js';
import { findProduct } from './catalog.js';

// Modelos de sugestão de compra para cliente novo: um mix de produtos com
// quantidades, montado uma vez e reaproveitado. Não guardam preço — o valor é
// sempre o da tabela em uso, então continuam certos quando a tabela muda.
const KEY = 'sugestoes';

/**
 * @typedef {{
 *   id: string,
 *   nome: string,
 *   items: import('../types.js').PedidoItem[],
 *   obs: string,
 *   criadoEm: string,
 *   atualizadoEm: string,
 * }} Sugestao
 */

/** @returns {Sugestao} */
export function novaSugestao() {
  const agora = new Date().toISOString();
  return { id: uid(), nome: '', items: [], obs: '', criadoEm: agora, atualizadoEm: agora };
}

/** @returns {Promise<Sugestao[]>} */
export async function listarSugestoes() {
  const lista = await store.get(KEY, []);
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((s) => s && typeof s === 'object' && Array.isArray(s.items))
    .sort((a, b) =>
      String(b.atualizadoEm || '').localeCompare(String(a.atualizadoEm || ''))
    );
}

/**
 * Grava a sugestão, substituindo a de mesmo `id` se já existir.
 * @param {Sugestao} sugestao
 * @returns {Promise<Sugestao>}
 */
export async function salvarSugestao(sugestao) {
  const lista = await listarSugestoes();
  const salva = { ...sugestao, atualizadoEm: new Date().toISOString() };
  await store.set(KEY, [salva, ...lista.filter((s) => s.id !== salva.id)]);
  return salva;
}

/** @param {string} id */
export async function excluirSugestao(id) {
  const lista = await listarSugestoes();
  await store.set(
    KEY,
    lista.filter((s) => s.id !== id)
  );
}

/**
 * Cópia independente, para montar uma variação sem mexer no original.
 * @param {Sugestao} sugestao
 * @returns {Promise<Sugestao>}
 */
export async function duplicarSugestao(sugestao) {
  const copia = {
    ...novaSugestao(),
    nome: `${rotuloSugestao(sugestao)} (cópia)`,
    items: sugestao.items.map((i) => ({ ...i })),
    obs: sugestao.obs,
  };
  return salvarSugestao(copia);
}

/** @param {{ nome?: string }} sugestao */
export function rotuloSugestao(sugestao) {
  return (sugestao?.nome || '').trim() || 'Sugestão sem nome';
}

/**
 * Separa os itens cujo produto ainda existe no catálogo dos que saíram da
 * tabela desde que a sugestão foi montada.
 *
 * @param {import('../types.js').PedidoItem[]} items
 */
export function separarItens(items) {
  const validos = [];
  const fora = [];
  for (const item of items) (findProduct(item.codigo) ? validos : fora).push(item);
  return { validos, fora };
}
