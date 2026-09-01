import * as XLSX from 'xlsx';
import { DEFAULT_PRODUCTS } from '../data/products.js';

/** @typedef {import('../types.js').Product} Product */

// Singleton mutável do catálogo em uso (mesma semântica do `let` de módulo original).
/** @type {Product[]} */
export let PRODUCTS = [...DEFAULT_PRODUCTS];

/** @param {Product[]} next */
export function setProducts(next) {
  PRODUCTS = next;
}

// ---- Catalog parsing & merging ----

// Infer category from product name when the table doesn't provide a Categoria column
function inferCategoria(nome) {
  const n = (nome || '').toUpperCase();
  if (/\bSHAKE\b/.test(n)) return 'WHEY SHAKE';
  if (/\bWHEY\b/.test(n)) return 'WHEY IOGURTE';
  if (/\bSOBREMESA\b/.test(n)) return 'SOBREMESA';
  if (/\bCREME DE LEITE\b/.test(n)) return 'CREME';
  if (/\b(COTTAGE|REQUEIJAO|REQUEIJÃO|MANTEIGA|COALHADA|PASTA)\b/.test(n))
    return 'PASTAS';
  if (/\bQUEIJO\b/.test(n)) return 'QUEIJO';
  if (/\b(IOG|IOGURTE|KEFIR|LACFREE|PROBIOTICO|PROBIÓTICO)\b/.test(n))
    return 'IOGURTE';
  return 'OUTROS';
}

export async function parsePriceTable(file) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new Error('Arquivo .xlsx sem planilhas.');
  }
  // Prefer sheet named "Export"; otherwise use first
  const sheetName =
    wb.SheetNames.find((n) => /export/i.test(n)) || wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  if (rows.length === 0) throw new Error('Planilha vazia.');

  // Map columns tolerantly (Verde Campo can vary naming)
  const headers = Object.keys(rows[0]);
  const findCol = (...candidates) => {
    for (const c of candidates) {
      const found = headers.find(
        (h) => h.trim().toLowerCase() === c.toLowerCase()
      );
      if (found) return found;
    }
    return null;
  };
  const COL_CODIGO = findCol(
    'Código',
    'Codigo',
    'Cod. TOTVS',
    'Cód. TOTVS',
    'Material'
  );
  const COL_DESC = findCol(
    'Descrição',
    'Descricao',
    'Produto',
    'Texto breve material'
  );
  const COL_PRECO = findCol(
    'Preço com ST',
    'Preco com ST',
    'Preço c/ ST',
    'Preço'
  );
  const COL_CAT = findCol('Categoria');
  const COL_SUB = findCol('Subcategoria');
  const COL_LINHA = findCol('Linha');

  if (!COL_CODIGO || !COL_DESC || !COL_PRECO) {
    throw new Error(
      `Colunas obrigatórias não encontradas. A tabela precisa ter: Código, Descrição, Preço com ST.\n\nColunas detectadas: ${headers.join(
        ', '
      )}`
    );
  }

  const products = [];
  const seen = new Set();
  for (const row of rows) {
    const codigoRaw = row[COL_CODIGO];
    const descRaw = row[COL_DESC];
    const precoRaw = row[COL_PRECO];
    if (codigoRaw == null || descRaw == null || precoRaw == null) continue;
    const codigo = String(codigoRaw).trim();
    const descStr = String(descRaw).trim();
    if (!codigo || !descStr) continue;
    if (seen.has(codigo)) continue; // skip duplicates
    seen.add(codigo);

    const precoNum =
      typeof precoRaw === 'number'
        ? precoRaw
        : parseFloat(String(precoRaw).replace(',', '.'));
    if (isNaN(precoNum) || precoNum <= 0) continue;

    const match = descStr.match(/CX\s*(\d+)/i);
    const un_cx = match ? parseInt(match[1], 10) : 12;

    let nome = descStr
      .replace(/\s+CX\s*\d+\s*$/i, '')
      .replace(/\s+VC\s+/g, ' ')
      .replace(/\s+VC\s*$/i, '')
      .trim()
      .replace(/\s+/g, ' ');

    const catFromCol = COL_CAT ? String(row[COL_CAT] || '').trim() : '';
    products.push({
      codigo,
      categoria: catFromCol || inferCategoria(nome),
      subcategoria: COL_SUB ? String(row[COL_SUB] || '').trim() : '',
      linha: COL_LINHA ? String(row[COL_LINHA] || '').trim() : '',
      descricao_original: descStr,
      nome,
      un_cx,
      preco_st: Math.round(precoNum * 100) / 100,
    });
  }

  if (products.length === 0) {
    throw new Error(
      'Nenhum produto válido foi encontrado na planilha. Verifique se os preços estão preenchidos.'
    );
  }
  return products;
}

export function mergeProducts(newList, oldList) {
  const oldMap = {};
  oldList.forEach((p) => {
    oldMap[p.codigo] = p;
  });
  return newList.map((p) => {
    const old = oldMap[p.codigo];
    if (old) {
      return {
        ...p,
        // Preserve richer classification from existing catalog when present
        categoria: old.categoria || p.categoria,
        subcategoria: old.subcategoria || p.subcategoria,
        linha: old.linha || p.linha,
        sap: old.sap || '',
        ean: old.ean || '',
        secao: old.secao || p.linha || '',
        status: old.status || '',
        unidade: old.unidade || 'CX',
        peso_kg: old.peso_kg || 0,
        imagem: old.imagem || '',
      };
    }
    return {
      ...p,
      categoria: p.categoria || inferCategoria(p.nome),
      sap: '',
      ean: '',
      secao: p.linha || 'NOVOS',
      status: 'NOVO',
      unidade: 'CX',
      peso_kg: 0,
      imagem: '',
    };
  });
}

/** @param {string} codigo @returns {Product | undefined} */
export const findProduct = (codigo) =>
  PRODUCTS.find((p) => p.codigo === codigo);
