import { findProduct } from './catalog.js';

export const calcItem = (item) => {
  const p = findProduct(item.codigo);
  if (!p) return { totalUn: 0, vlUnit: 0, vlTotal: 0, totalKg: 0, isKg: false };
  const caixas = parseFloat(item.caixas) || 0;
  const desc = parseFloat(item.descPct) || 0;
  const totalUn = caixas * p.un_cx;
  const isKg = p.unidade === 'KG' && p.peso_kg > 0;
  let vlTotal,
    vlUnit,
    totalKg = 0;
  if (isKg) {
    totalKg = caixas * p.peso_kg;
    vlTotal = totalKg * p.preco_st * (1 - desc / 100);
    vlUnit = p.preco_st; // price per kg
  } else {
    vlTotal = caixas * p.preco_st * (1 - desc / 100);
    vlUnit = p.preco_st / p.un_cx;
  }
  return { totalUn, vlUnit, vlTotal, totalKg, isKg };
};

export const calcOrder = (items) => {
  let total = 0,
    totalCaixas = 0,
    totalBonif = 0,
    totalKg = 0;
  items.forEach((item) => {
    const c = calcItem(item);
    total += c.vlTotal;
    totalCaixas += parseFloat(item.caixas) || 0;
    totalBonif += parseFloat(item.bonif) || 0;
    totalKg += c.totalKg;
  });
  return { total, totalCaixas, totalBonif, totalKg };
};

export const calcBonifItem = (item) => {
  const p = findProduct(item.codigo);
  if (!p) return { valor: 0, isKg: false, unid: 'CX' };
  const qtd = parseFloat(item.qtd) || 0;
  const isKg = p.unidade === 'KG' && p.peso_kg > 0;
  // Valor = qtd (cx ou kg) × preço. Para kg, preço já é R$/kg. Para cx, preço é R$/cx.
  const valor = isKg ? qtd * p.preco_st : qtd * p.preco_st;
  return { valor, isKg, unid: isKg ? 'KG' : 'CX' };
};

export const calcBonifTotal = (items) => {
  return items.reduce((sum, item) => sum + calcBonifItem(item).valor, 0);
};
