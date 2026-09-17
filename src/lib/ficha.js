import JSZip from 'jszip';
import { FICHA_XLSB_B64 } from '../data/fichaTemplate.js';
import { downloadBlob } from './download.js';
import { mapRecords, cellStRecord, parseRef, REC } from './biff12.js';
import { FICHA_CELLS } from './fichaCampos.js';

export { FICHA_CELLS };

const XLSB_MIME = 'application/vnd.ms-excel.sheet.binary.macroEnabled.12';

/** A aba "FICHA INDIVIDUAL" é a terceira do arquivo. */
const SHEET = 'xl/worksheets/sheet3.bin';


// A aba "Orientações Preenchimento" do modelo manda: tudo em letra maiúscula e
// sem acento. Aplicamos na saída para a ficha nunca sair fora do padrão.
/** @param {unknown} valor @returns {string} */
export function normalizarTexto(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .trim();
}

/** @param {string} b64 @returns {Uint8Array} */
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Remove uma parte do pacote junto das referências que apontam para ela. */
async function removerParte(zip, parte, relsPath, relPredicate) {
  zip.remove(parte);

  const types = await zip.file('[Content_Types].xml').async('string');
  zip.file(
    '[Content_Types].xml',
    types.replace(
      new RegExp(`<Override PartName="/${parte}"[^>]*/>`),
      ''
    )
  );

  const rels = await zip.file(relsPath).async('string');
  zip.file(
    relsPath,
    rels.replace(/<Relationship\b[^>]*\/>/g, (tag) =>
      relPredicate(tag) ? '' : tag
    )
  );
}

/**
 * Preenche o modelo oficial em branco e devolve um .xlsb pronto.
 *
 * A edição é cirúrgica: percorremos o fluxo de registros da aba e trocamos
 * apenas os registros das células mapeadas, mantendo estilo, bordas, listas
 * suspensas, logo, fórmulas e as abas auxiliares exatamente como vieram.
 *
 * Devolve os bytes do arquivo — quem baixa é `exportarFichaCadastro`, para
 * que a montagem possa ser testada sem depender do navegador.
 *
 * @param {Record<string, string>} form
 * @returns {Promise<Uint8Array>}
 */
export async function montarFichaCadastro(form) {
  const zip = await JSZip.loadAsync(b64ToBytes(FICHA_XLSB_B64));

  // (linha,coluna) -> texto já normalizado. Campos não preenchidos entram como
  // string vazia de propósito: as fórmulas do modelo testam `=""` e uma célula
  // realmente vazia faria a referência virar 0 na aba de importação.
  /** @type {Map<string, string>} */
  const alvos = new Map();
  for (const [campo, ref] of Object.entries(FICHA_CELLS)) {
    const { row, col } = parseRef(ref);
    alvos.set(`${row}:${col}`, normalizarTexto(form[campo]));
  }

  const original = await zip.file(SHEET).async('uint8array');
  const preenchida = mapRecords(original, ({ id, row, col, payload }) => {
    const texto = alvos.get(`${row}:${col}`);
    if (texto === undefined) return null;
    // Os campos de lista vêm com "Selecionar" gravado; sem escolha do usuário
    // eles ficam como estão, senão o dropdown apareceria em branco.
    if (id === REC.CELL_ISST) return texto ? cellStRecord(payload, texto) : null;
    if (id !== REC.CELL_BLANK) return null;
    return cellStRecord(payload, texto);
  });
  zip.file(SHEET, preenchida);

  // O índice binário guarda deslocamentos dentro da aba e fica inválido depois
  // da edição; o calcChain congela a ordem de cálculo das fórmulas. Sem os
  // dois, o Excel reconstrói ambos ao abrir.
  await removerParte(
    zip,
    'xl/worksheets/binaryIndex3.bin',
    'xl/worksheets/_rels/sheet3.bin.rels',
    (tag) => tag.includes('binaryIndex3.bin')
  );
  await removerParte(
    zip,
    'xl/calcChain.bin',
    'xl/_rels/workbook.bin.rels',
    (tag) => tag.includes('calcChain.bin')
  );

  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

/**
 * Monta a ficha preenchida e entrega o download ao usuário.
 * @param {Record<string, string>} form
 */
export async function exportarFichaCadastro(form) {
  const bytes = await montarFichaCadastro(form);
  downloadBlob(bytes, nomeArquivoFicha(form), XLSB_MIME);
}

/** Baixa o modelo oficial intocado — rede de segurança. */
export function baixarFichaEmBranco() {
  downloadBlob(
    b64ToBytes(FICHA_XLSB_B64),
    'Ficha_Cadastro_EM_BRANCO.xlsb',
    XLSB_MIME
  );
}

/** @param {string} valor @param {number} max */
function pedaco(valor, max) {
  return normalizarTexto(valor)
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, max);
}

/**
 * Matriz e filiais são fichas do mesmo cliente: só o nome da empresa faria as
 * três nascerem com o mesmo arquivo, e o navegador numeraria (1), (2). Por
 * isso entra também o município e, quando existe, o nome abreviado — que a
 * Verde Campo exige ser único por cadastro.
 *
 * @param {Record<string, string>} form
 * @returns {string}
 */
export function nomeArquivoFicha(form) {
  const partes = [
    pedaco(form.nomeFantasia || form.razaoSocial, 28) || 'CLIENTE',
    pedaco(form.municipio, 20),
    pedaco(form.nomeAbrev, 12),
  ].filter(Boolean);
  return `Ficha_Cadastro_${[...new Set(partes)].join('_')}.xlsb`;
}
