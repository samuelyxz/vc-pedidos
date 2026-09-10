import { store } from './storage.js';
import { uid } from './format.js';

// Histórico das fichas cadastrais geradas. Guarda o formulário inteiro, para
// dar para conferir depois, gerar de novo e aproveitar numa filial.
const KEY = 'fichas';

/** @typedef {{ id: string, criadoEm: string, atualizadoEm: string, form: Record<string, string> }} FichaSalva */

/** @returns {Promise<FichaSalva[]>} */
export async function listarFichas() {
  const lista = await store.get(KEY, []);
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((f) => f && typeof f === 'object' && f.form)
    .sort((a, b) =>
      String(b.atualizadoEm || '').localeCompare(String(a.atualizadoEm || ''))
    );
}

/**
 * Grava a ficha. Com `id`, atualiza a que já existe em vez de criar outra —
 * é o caso de abrir uma ficha salva, corrigir algo e gerar de novo.
 *
 * @param {Record<string, string>} form
 * @param {string} [id]
 * @returns {Promise<FichaSalva>}
 */
export async function salvarFicha(form, id) {
  const lista = await listarFichas();
  const agora = new Date().toISOString();
  const existente = id ? lista.find((f) => f.id === id) : null;

  const ficha = existente
    ? { ...existente, form, atualizadoEm: agora }
    : { id: uid(), criadoEm: agora, atualizadoEm: agora, form };

  const outras = lista.filter((f) => f.id !== ficha.id);
  await store.set(KEY, [ficha, ...outras]);
  return ficha;
}

/** @param {string} id */
export async function excluirFicha(id) {
  const lista = await listarFichas();
  await store.set(
    KEY,
    lista.filter((f) => f.id !== id)
  );
}

/**
 * Como a ficha aparece na lista.
 * @param {Record<string, string>} form
 */
export function rotuloFicha(form) {
  const nome = (form?.razaoSocial || form?.nomeFantasia || '').trim();
  return nome || 'Ficha sem nome';
}

// O que pertence à unidade e não à empresa. Numa filial isso tudo muda: o
// CNPJ é outro, a inscrição estadual é outra, o endereço é outro, e o nome
// abreviado não pode repetir cadastro existente.
const DA_UNIDADE = [
  'cnpj',
  'ie',
  'suframa',
  'nomeAbrev',
  'logradouro',
  'numero',
  'bairro',
  'cep',
  'municipio',
  'estado',
  'complemento',
  'telefone',
  'cob_logradouro',
  'cob_numero',
  'cob_bairro',
  'cob_cep',
  'cob_municipio',
  'cob_estado',
  'cob_complemento',
  'cob_telefone',
  'ent_logradouro',
  'ent_numero',
  'ent_bairro',
  'ent_cep',
  'ent_municipio',
  'ent_estado',
  'ent_complemento',
  'ent_telefone',
];

/**
 * Aproveita uma ficha para abrir a de uma filial: mantém o que é da empresa
 * (razão social, banco, representante, tabela, referências) e zera o que é
 * de cada unidade.
 *
 * @param {Record<string, string>} form
 * @returns {Record<string, string>}
 */
export function paraFilial(form) {
  const novo = { ...form };
  for (const campo of DA_UNIDADE) novo[campo] = '';
  novo.filial = 'S';
  return novo;
}
