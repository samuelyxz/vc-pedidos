import { SECAO_ORDER } from './constants.js';
import { findProduct } from './catalog.js';
import { calcItem, calcOrder } from './calc.js';
import { formatDate, todayISO } from './format.js';
import { downloadBlob } from './download.js';
import {
  XLSX_MIME,
  FONT,
  MONO,
  BRL_FMT,
  fill,
  outline,
  spacer,
  bannerRow,
  loadExcelJS,
} from './xlsx.js';

const NCOLS = 11;
const COL_WIDTHS = [16, 15, 18, 44, 9, 9, 9, 12, 15, 9, 16];

const C = {
  dark: '2A2A2A',
  dark2: '3A3A3A',
  greyLabel: 'EDEDED',
  greySection: 'C8C8C8',
  greyHeader: 'D9D9D9',
  yellow: 'FFF5CC',
  footer: 'F5F5F5',
  muted: 'FF555555',
};

const box = (ws, r) => outline(ws, r, 1, NCOLS);
const banner = (ws, text, bgHex, opts) => bannerRow(ws, NCOLS, text, bgHex, opts);

function infoRow(ws, label1, val1, label2, val2, centerVal) {
  const row = ws.addRow([label1, val1, '', '', '', '', label2, val2]);
  const r = row.number;
  ws.mergeCells(r, 2, r, 6);
  ws.mergeCells(r, 8, r, NCOLS);
  for (const c of [1, 7]) {
    const x = ws.getCell(r, c);
    x.font = { ...FONT, bold: true };
    x.fill = fill(C.greyLabel);
    x.alignment = { vertical: 'middle' };
  }
  for (const c of [2, 8]) {
    const x = ws.getCell(r, c);
    x.font = FONT;
    x.alignment = {
      vertical: 'middle',
      horizontal: centerVal ? 'center' : 'left',
    };
  }
  box(ws, r);
}

export async function buildPedidoWorkbook(pedido, cliente, vendedor) {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  wb.creator = 'VC Pedidos';
  wb.created = new Date();
  const ws = wb.addWorksheet('Pedido', { views: [{ showGridLines: false }] });
  ws.columns = COL_WIDTHS.map((width) => ({ width }));

  // Agrupa itens por seção, na ordem do template
  const grouped = {};
  pedido.items.forEach((item) => {
    const p = findProduct(item.codigo);
    if (!p) return;
    const sect = p.secao || 'OUTROS';
    (grouped[sect] ||= []).push({ item, p });
  });
  const sortedSections = Object.keys(grouped).sort((a, b) => {
    const ia = SECAO_ORDER.indexOf(a);
    const ib = SECAO_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const { total, totalCaixas, totalBonif, totalKg } = calcOrder(pedido.items);
  const hasExtras = pedido.items.some((i) => i.isExtra);

  banner(
    ws,
    `PEDIDO DE VENDA${pedido.numero ? ` — Nº ${pedido.numero}` : ''}`,
    C.dark,
    { size: 14, height: 26 }
  );
  banner(ws, 'LATICÍNIOS VERDE CAMPO S.A.', C.dark2, { size: 10 });
  spacer(ws);

  {
    const row = ws.addRow([
      'DADOS DO CLIENTE',
      '',
      '',
      '',
      '',
      '',
      'DADOS DO PEDIDO',
    ]);
    const r = row.number;
    ws.mergeCells(r, 1, r, 6);
    ws.mergeCells(r, 7, r, NCOLS);
    for (const c of [1, 7]) {
      const x = ws.getCell(r, c);
      x.font = { ...FONT, bold: true };
      x.fill = fill(C.greyHeader);
      x.alignment = { horizontal: 'center', vertical: 'middle' };
    }
    box(ws, r);
  }

  const cidadeUf = cliente?.cidade
    ? ` — ${cliente.cidade}${cliente.uf ? '/' + cliente.uf : ''}`
    : '';
  infoRow(ws, 'Razão Social', cliente?.razaoSocial || '-', 'Data', formatDate(pedido.data), true);
  infoRow(ws, 'CNPJ', cliente?.cnpj || '-', 'Nº Pedido', pedido.numero || '-', true);
  infoRow(ws, 'IE', cliente?.ie || '-', 'Vendedor', vendedor?.nome || '-');
  infoRow(ws, 'Telefone', cliente?.telefone || '-', 'Tel. Vendedor', vendedor?.telefone || '-');
  infoRow(
    ws,
    'Endereço',
    (cliente?.endereco || '-') + cidadeUf,
    'E-mail Vend.',
    vendedor?.email || '-'
  );
  const nItens = pedido.items.length;
  infoRow(
    ws,
    'Contato',
    cliente?.contato || '-',
    'Total Itens',
    `${nItens} produto${nItens !== 1 ? 's' : ''} · ${totalCaixas} caixa${
      totalCaixas !== 1 ? 's' : ''
    }`,
    true
  );
  spacer(ws);

  {
    const headers = [
      'Cód. SAP',
      'Cód. TOTVS',
      'Cód. EAN',
      'Produto',
      'Caixas',
      'Bonif.',
      'Un/Cx',
      'Total Un.',
      'Valor Unit.',
      'Desc%',
      'Vl. Total',
    ];
    const row = ws.addRow(headers);
    const r = row.number;
    for (let c = 1; c <= NCOLS; c++) {
      const x = ws.getCell(r, c);
      x.font = { ...FONT, bold: true, size: 9.5, color: { argb: 'FFFFFFFF' } };
      x.fill = fill(C.dark);
      x.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }
    box(ws, r);
  }

  for (const section of sortedSections) {
    const row = ws.addRow([section]);
    const r = row.number;
    ws.mergeCells(r, 1, r, NCOLS);
    const x = ws.getCell(r, 1);
    x.font = { ...FONT, bold: true, size: 11 };
    x.fill = fill(C.greySection);
    x.alignment = { horizontal: 'left', vertical: 'middle' };
    box(ws, r);

    for (const { item, p } of grouped[section]) {
      const c = calcItem(item);
      const descVal = parseFloat(item.descPct) || 0;

      const nameRuns = [{ text: p.nome, font: { ...FONT } }];
      if (c.isKg) {
        nameRuns.push({
          text: `  (${String(p.peso_kg).replace('.', ',')} kg/cx)`,
          font: { name: 'Calibri', size: 8, color: { argb: C.muted } },
        });
      }
      if (item.obs) {
        nameRuns.push({
          text: `\nObs: ${item.obs}`,
          font: { name: 'Calibri', size: 8, color: { argb: C.muted } },
        });
      }

      const dataRow = ws.addRow([
        p.sap || '-',
        p.codigo,
        p.ean || '-',
        { richText: nameRuns },
        Number(item.caixas) || 0,
        Number(item.bonif) || 0,
        p.un_cx,
        c.isKg ? c.totalKg : c.totalUn,
        c.vlUnit,
        descVal > 0 ? descVal : '-',
        c.vlTotal,
      ]);
      const r2 = dataRow.number;

      for (let col = 1; col <= NCOLS; col++) ws.getCell(r2, col).font = FONT;
      for (const col of [1, 2, 3]) {
        const x = ws.getCell(r2, col);
        x.font = { ...MONO, bold: col === 2 };
        x.alignment = { horizontal: 'center', vertical: 'middle' };
      }
      ws.getCell(r2, 4).alignment = { vertical: 'middle', wrapText: true };
      for (const col of [5, 6, 7, 8, 10]) {
        ws.getCell(r2, col).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      ws.getCell(r2, 8).numFmt = c.isKg ? '#,##0.00" kg"' : '0';
      for (const col of [5, 6, 7]) ws.getCell(r2, col).numFmt = '0';
      if (descVal > 0) ws.getCell(r2, 10).numFmt = '0"%"';
      for (const col of [9, 11]) {
        const x = ws.getCell(r2, col);
        x.numFmt = BRL_FMT;
        x.alignment = { horizontal: 'right', vertical: 'middle' };
      }
      ws.getCell(r2, 11).font = { ...FONT, bold: true };

      if (item.isExtra) {
        for (let col = 1; col <= NCOLS; col++) {
          ws.getCell(r2, col).fill = fill(C.yellow);
        }
      }
      box(ws, r2);
    }
  }

  spacer(ws, 4);

  {
    const summaryParts = [`Total de Caixas: ${totalCaixas}`];
    if (totalKg > 0) {
      summaryParts.push(
        `Peso Total: ${totalKg.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} kg`
      );
    }
    if (totalBonif > 0) summaryParts.push(`Bonificação: ${totalBonif}`);

    const row = ws.addRow([summaryParts.join(' · ')]);
    const r = row.number;
    ws.mergeCells(r, 1, r, 4);
    ws.mergeCells(r, 5, r, 10);
    ws.getCell(r, 11).value = total;

    const sLbl = ws.getCell(r, 1);
    sLbl.font = { ...FONT, bold: true };
    sLbl.fill = fill(C.greyLabel);
    sLbl.alignment = { horizontal: 'center', vertical: 'middle' };

    for (const col of [5, 11]) {
      const x = ws.getCell(r, col);
      x.font = { ...FONT, bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      x.fill = fill(C.dark);
      x.alignment = { horizontal: 'right', vertical: 'middle' };
    }
    ws.getCell(r, 5).value = 'TOTAL DO PEDIDO';
    ws.getCell(r, 11).numFmt = BRL_FMT;
    box(ws, r);
    row.height = 20;
  }

  if (pedido.obs) {
    spacer(ws, 4);
    const row = ws.addRow(['Observações', pedido.obs]);
    const r = row.number;
    ws.mergeCells(r, 2, r, NCOLS);
    const lbl = ws.getCell(r, 1);
    lbl.font = { ...FONT, bold: true };
    lbl.fill = fill(C.greyLabel);
    lbl.alignment = { vertical: 'middle' };
    ws.getCell(r, 2).alignment = { vertical: 'middle', wrapText: true };
    box(ws, r);
  }

  if (hasExtras) {
    banner(
      ws,
      'Itens destacados em amarelo claro são sugestões adicionadas ao pedido original do cliente.',
      C.footer,
      { color: 'FF555555', align: 'left', italic: true, bold: false, size: 9 }
    );
  }

  spacer(ws);
  banner(
    ws,
    'Fornecedor: LATICÍNIOS VERDE CAMPO S.A. · Av. Luiz Gomide, Lavras-MG · CNPJ: 07.757.005/0001-02 · Frete a pagar · Transportadora: __________',
    C.footer,
    { color: 'FF555555', align: 'left', italic: true, size: 9 }
  );

  return wb;
}

export async function exportPedidoStyled(pedido, cliente, vendedor) {
  const wb = await buildPedidoWorkbook(pedido, cliente, vendedor);
  const buf = await wb.xlsx.writeBuffer();
  const clienteName = (cliente?.razaoSocial || 'Cliente')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 30);
  const numero = pedido.numero || todayISO().replace(/-/g, '');
  downloadBlob(buf, `Pedido_${numero}_${clienteName}.xlsx`, XLSX_MIME);
}
