import JSZip from 'jszip';
import { FICHA_MASSA_B64 } from '../data/fichaMassaTemplate.js';
import { BANCOS, REPRESENTANTES } from '../data/fichaBase.js';
import { downloadBlob } from './download.js';
import { normalizarTexto } from './ficha.js';
import { escreverCelulas, parseRef, REC } from './biff12.js';

const XLSB_MIME = 'application/vnd.ms-excel.sheet.binary.macroEnabled.12';

/** Aba "CLIENTES DATASUL " (o espaço no fim é do arquivo original). */
const ABA_CLIENTES = 'xl/worksheets/sheet1.bin';
/** Aba "Template": a linha que a Verde Campo importa no sistema. */
const ABA_TEMPLATE = 'xl/worksheets/sheet4.bin';

/** Primeira linha de cliente e quantas cabem. */
export const PRIMEIRA_LINHA = 5;
export const MAX_CLIENTES = 34;

// Campo do formulário -> coluna da aba de preenchimento. Uma linha por cliente.
const COLUNAS = {
  cnpj: 'B',
  ie: 'C',
  suframa: 'D',
  razaoSocial: 'E',
  nomeFantasia: 'F',
  nomeAbrev: 'G',
  resp_vendas: 'H',
  banco: 'J',
  agencia: 'L',
  conta: 'M',

  logradouro: 'N',
  numero: 'O',
  bairro: 'P',
  municipio: 'Q',
  estado: 'R',
  cep: 'S',
  complemento: 'T',

  cob_logradouro: 'U',
  cob_numero: 'V',
  cob_bairro: 'W',
  cob_municipio: 'X',
  cob_estado: 'Y',
  cob_cep: 'Z',
  cob_complemento: 'AA',
  cob_telefone: 'AB',

  ent_logradouro: 'AC',
  ent_numero: 'AD',
  ent_bairro: 'AE',
  ent_municipio: 'AF',
  ent_estado: 'AG',
  ent_cep: 'AH',
  ent_complemento: 'AI',
  ent_telefone: 'AJ',

  fin_nome: 'AK',
  fin_telefone: 'AL',
  fin_email: 'AM',
  email_nf: 'AN',

  forn1: 'AO',
  forn1_tel: 'AP',
  forn1_email: 'AQ',
  forn2: 'AR',
  forn2_tel: 'AS',
  forn2_email: 'AT',
  forn3: 'AU',
  forn3_tel: 'AV',
  forn3_email: 'AW',

  frete: 'AX',
  edi: 'AY',
  tabela_preco: 'AZ',
  limite_credito: 'BA',
  prazo_pagamento: 'BB',
  forma_pagamento: 'BC',
};

// Colunas da aba Template cujo conteúdo é código do sistema, não texto do
// cliente: a regra de "maiúscula sem acento" não vale para elas, e mudar a
// caixa faria o valor deixar de bater com o que a fórmula original produz.
const LITERAIS = new Set(['K']);

/** Códigos que a planilha resolveria por VLOOKUP na aba Base. */
const COL_COD_REPRESENTANTE = 'I';
const COL_COD_BANCO = 'K';

/** @param {string} letras @returns {number} */
function coluna(letras) {
  return parseRef(`${letras}1`).col;
}

/** @param {Record<string, string>} form */
function codigoBanco(form) {
  const nome = normalizarTexto(form.banco);
  return BANCOS.find((b) => normalizarTexto(b.nome) === nome)?.codigo || '';
}

/** @param {Record<string, string>} form */
function codigoRepresentante(form) {
  const nome = normalizarTexto(form.resp_vendas);
  return (
    REPRESENTANTES.find((r) => normalizarTexto(r.nome) === nome)?.codigo || ''
  );
}

// O modelo da Verde Campo só monta a linha de importação do PRIMEIRO cliente:
// da segunda em diante, 26 das 36 colunas estão sem fórmula. Como o arquivo é
// justamente para cadastro em massa, entregá-lo assim faria os clientes 2, 3...
// chegarem sem CNPJ, razão social, banco, representante e endereço.
//
// Aqui calculamos o mesmo que as fórmulas do cliente 1 calculariam e gravamos
// o resultado nas linhas seguintes. A aba de preenchimento continua idêntica;
// só a de importação passa a valer para todos.
//
// Coluna da aba Template -> como o valor sai dos dados do cliente.
const TEMPLATE = {
  B: (f) => f.nomeAbrev,
  C: (f) => f.razaoSocial,
  D: (f) => f.nomeFantasia,
  F: (f) => codigoRepresentante(f),
  G: (f) => f.resp_vendas,
  K: (f) =>
    normalizarTexto(f.forma_pagamento) === 'DEPOSITO'
      ? 'Carteira'
      : 'Cb Simples',
  L: (f) => codigoBanco(f),
  T: (f) => `${normalizarTexto(f.logradouro)},${normalizarTexto(f.numero)}`,
  U: (f) => f.bairro,
  V: (f) => f.municipio,
  W: (f) => f.cep,
  X: (f) => f.estado,
  // o modelo puxa o complemento da COBRANÇA aqui; mantido como está lá
  Y: (f) => f.cob_complemento,
  AA: (f) =>
    `${normalizarTexto(f.cob_logradouro)},${normalizarTexto(f.cob_numero)}`,
  AB: (f) => f.cob_bairro,
  AC: (f) => f.cob_municipio,
  AD: (f) => f.cob_cep,
  AE: (f) => f.cob_estado,
  AF: (f) => f.cob_telefone,
  AG: (f) => f.fin_email,
  AH: (f) => f.email_nf,
  AL: (f) => f.tabela_preco,
  AP: (f) => f.cnpj,
  AQ: (f) => f.ie,
  BF: (f) => f.nomeAbrev,
  BG: (f) => {
    const ie = normalizarTexto(f.ie);
    if (ie === 'ISENTO') return 'N';
    return ie ? 'S' : '';
  },
};

/**
 * Monta a ficha de cadastro em massa com os clientes informados.
 *
 * @param {Record<string, string>[]} clientes um por linha, na ordem
 * @returns {Promise<Uint8Array>}
 */
export async function montarFichaMassa(clientes) {
  const lista = (clientes || []).slice(0, MAX_CLIENTES);
  if (lista.length === 0) {
    throw new Error('Escolha pelo menos um cliente para a ficha em massa.');
  }

  const zip = await JSZip.loadAsync(b64ToBytes(FICHA_MASSA_B64));

  // ---- aba de preenchimento ----
  /** @type {Map<string, string>} */
  const preenchimento = new Map();
  lista.forEach((form, i) => {
    const linha = PRIMEIRA_LINHA + i;
    for (const [campo, letras] of Object.entries(COLUNAS)) {
      preenchimento.set(
        `${linha}:${coluna(letras)}`,
        normalizarTexto(form[campo])
      );
    }
    // Os códigos sairiam de VLOOKUP, mas a coluna do representante só tem
    // fórmula na primeira linha e a do banco está quebrada em duas outras.
    preenchimento.set(
      `${linha}:${coluna(COL_COD_REPRESENTANTE)}`,
      codigoRepresentante(form)
    );
    preenchimento.set(`${linha}:${coluna(COL_COD_BANCO)}`, codigoBanco(form));
  });

  zip.file(
    ABA_CLIENTES,
    escreverCelulas(
      await zip.file(ABA_CLIENTES).async('uint8array'),
      preenchimento
    )
  );

  // ---- aba de importação ----
  // A linha do primeiro cliente tem as fórmulas certas: deixamos ela em paz e
  // completamos só da segunda em diante.
  /** @type {Map<string, string>} */
  const importacao = new Map();
  lista.slice(1).forEach((form, i) => {
    const linha = 3 + i; // linha 2 é o cliente 1
    for (const [letras, valor] of Object.entries(TEMPLATE)) {
      const bruto = valor(form);
      importacao.set(
        `${linha}:${coluna(letras)}`,
        LITERAIS.has(letras) ? bruto : normalizarTexto(bruto)
      );
    }
  });

  if (importacao.size) {
    zip.file(
      ABA_TEMPLATE,
      escreverCelulas(
        await zip.file(ABA_TEMPLATE).async('uint8array'),
        importacao,
        // uma célula com fórmula já resolve sozinha; não sobrescrever
        ({ id }) => id >= REC.FMLA_STRING
      )
    );
  }

  await removerParte(zip, 'xl/worksheets/binaryIndex1.bin', [
    'xl/worksheets/_rels/sheet1.bin.rels',
  ]);
  await removerParte(zip, 'xl/worksheets/binaryIndex4.bin', [
    'xl/worksheets/_rels/sheet4.bin.rels',
  ]);
  await removerParte(zip, 'xl/calcChain.bin', ['xl/_rels/workbook.bin.rels']);

  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

/** @param {Record<string, string>[]} clientes */
export async function exportarFichaMassa(clientes) {
  const bytes = await montarFichaMassa(clientes);
  downloadBlob(bytes, nomeArquivoMassa(clientes), XLSB_MIME);
}

/** Baixa o modelo oficial em branco, intocado. */
export function baixarFichaMassaEmBranco() {
  downloadBlob(
    b64ToBytes(FICHA_MASSA_B64),
    'Ficha_Cadastro_EM_MASSA_EM_BRANCO.xlsb',
    XLSB_MIME
  );
}

/**
 * A ficha em massa é de uma rede; o nome do arquivo usa o cliente do topo e
 * quantos vão junto.
 * @param {Record<string, string>[]} clientes
 */
export function nomeArquivoMassa(clientes) {
  const primeiro = clientes?.[0] || {};
  const base =
    normalizarTexto(primeiro.nomeFantasia || primeiro.razaoSocial)
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 30) || 'CLIENTES';
  return `Ficha_Cadastro_EM_MASSA_${base}_${clientes.length}_CLIENTES.xlsb`;
}

/** @param {string} b64 @returns {Uint8Array} */
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Remove uma parte do pacote junto das referências que apontam para ela. */
async function removerParte(zip, parte, relsPaths) {
  zip.remove(parte);
  const nome = parte.split('/').pop();

  const types = await zip.file('[Content_Types].xml').async('string');
  zip.file(
    '[Content_Types].xml',
    types.replace(new RegExp(`<Override PartName="/${parte}"[^>]*/>`), '')
  );

  for (const rels of relsPaths) {
    const arquivo = zip.file(rels);
    if (!arquivo) continue;
    const xml = await arquivo.async('string');
    zip.file(
      rels,
      xml.replace(/<Relationship\b[^>]*\/>/g, (tag) =>
        tag.includes(nome) ? '' : tag
      )
    );
  }
}
