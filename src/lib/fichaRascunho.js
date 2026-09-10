import { store } from './storage.js';

// Preenchimento em andamento da ficha cadastral. Fica fora do backup de
// propósito: é trabalho inacabado, não dado do negócio.
const KEY = 'ficha_rascunho';

/** @typedef {{ form: Record<string, string>, salvoEm: string }} Rascunho */

/**
 * Como o rascunho aparece para o usuário. Sem nome nenhum preenchido ainda,
 * devolve null — não adianta oferecer "continuar" uma ficha em branco.
 * @param {Record<string, string>} form
 * @returns {string | null}
 */
export function rotuloRascunho(form) {
  const nome = (form?.razaoSocial || form?.nomeFantasia || '').trim();
  return nome || null;
}

/** @param {Record<string, string>} form */
export function salvarRascunho(form) {
  return store.set(KEY, { form, salvoEm: new Date().toISOString() });
}

/** @returns {Promise<Rascunho | null>} */
export async function lerRascunho() {
  const r = await store.get(KEY, null);
  if (!r || typeof r !== 'object' || !r.form || typeof r.form !== 'object') {
    return null;
  }
  return r;
}

export function limparRascunho() {
  return store.delete(KEY);
}
