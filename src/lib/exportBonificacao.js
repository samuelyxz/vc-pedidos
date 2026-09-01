import { findProduct } from './catalog.js';
import { calcBonifItem, calcBonifTotal } from './calc.js';
import { formatDate, todayISO } from './format.js';
import { downloadBlob } from './download.js';
import {
  XLSX_MIME,
  FONT,
  BRL_FMT,
  fill,
  outline,
  spacer,
  bannerRow,
  loadExcelJS,
} from './xlsx.js';

const NCOLS = 13;
const COL_WIDTHS = [20, 17, 11, 13, 20, 40, 22, 16, 12, 8, 15, 13, 13];
const DARK = '375F5C';
const GREY_LABEL = 'EDEDED';
const PCT_FMT = '0.0%';

const box = (ws, r) => outline(ws, r, 1, NCOLS);

const HEADERS = [
  'Supervisor',
  'Vendedor',
  'Data',
  'Cod Cliente',
  'Rede',
  'Nome Fantasia',
  'Motivo da Bonificação',
  'Produto',
  'Cod Produto',
  'Qtd',
  'Unid Venda',
  'Valor Bonificação',
  'Bonif vs Pedido',
];

export async function buildBonificacaoWorkbook(
  bonif,
  cliente,
  vendedor,
  supervisor
) {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  wb.creator = 'VC Pedidos';
  wb.created = new Date();
  const ws = wb.addWorksheet('Bonificação', {
    views: [{ showGridLines: false }],
  });
  ws.columns = COL_WIDTHS.map((width) => ({ width }));

  const items = bonif.items || [];
  const totalBonif = calcBonifTotal(items);
  const valorPedido = parseFloat(bonif.valorPedido) || 0;
  const mediaRSL = parseFloat(bonif.mediaRSL) || 0;

  bannerRow(
    ws,
    NCOLS,
    'PLANILHA DE AUTORIZAÇÃO E LANÇAMENTOS DOS PEDIDOS DE BONIFICAÇÃO E DEGUSTAÇÃO',
    DARK,
    { size: 13, wrap: true, height: 30 }
  );
  spacer(ws);

  // Bloco de informações (A..H preenchidos, I..M vazio sem borda)
  {
    const row = ws.addRow([
      'Nº Pedido Venda',
      bonif.numeroPedido || '-',
      'Valor Pedido Venda',
      valorPedido > 0 ? valorPedido : '-',
      'Média RSL (3 meses)',
      mediaRSL > 0 ? mediaRSL : '-',
      'Total Bonificação',
      totalBonif,
    ]);
    const r = row.number;
    for (const c of [1, 3, 5, 7]) {
      const x = ws.getCell(r, c);
      x.font = { ...FONT, bold: true };
      x.fill = fill(GREY_LABEL);
      x.alignment = { vertical: 'middle' };
    }
    ws.getCell(r, 2).alignment = { horizontal: 'center', vertical: 'middle' };
    for (const c of [4, 6, 8]) {
      const x = ws.getCell(r, c);
      x.alignment = { horizontal: 'right', vertical: 'middle' };
      if (typeof ws.getCell(r, c).value === 'number') x.numFmt = BRL_FMT;
    }
    ws.getCell(r, 8).font = { ...FONT, bold: true };
    outline(ws, r, 1, 8);
  }
  spacer(ws);

  // Cabeçalho da tabela
  {
    const row = ws.addRow(HEADERS);
    const r = row.number;
    for (let c = 1; c <= NCOLS; c++) {
      const x = ws.getCell(r, c);
      x.font = { ...FONT, bold: true, size: 9, color: { argb: 'FFFFFFFF' } };
      x.fill = fill(DARK);
      x.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }
    box(ws, r);
  }

  // Itens
  for (const item of items) {
    const p = findProduct(item.codigo);
    if (!p) continue;
    const c = calcBonifItem(item);
    const ratio = valorPedido > 0 ? c.valor / valorPedido : null;

    const row = ws.addRow([
      supervisor || '-',
      vendedor?.nome || '-',
      formatDate(bonif.data),
      cliente?.codCliente || cliente?.cnpj || '-',
      cliente?.rede || '-',
      cliente?.nomeFantasia || cliente?.razaoSocial || '-',
      bonif.motivo || '-',
      p.descricao_original || p.nome,
      p.codigo,
      Number(item.qtd) || 0,
      c.unid,
      c.valor,
      ratio === null ? '-' : ratio,
    ]);
    const r = row.number;
    for (let col = 1; col <= NCOLS; col++) ws.getCell(r, col).font = FONT;
    for (const col of [1, 2, 3, 4, 9, 10, 11, 13]) {
      ws.getCell(r, col).alignment = { horizontal: 'center', vertical: 'middle' };
    }
    for (const col of [5, 6, 7, 8]) {
      ws.getCell(r, col).alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      };
    }
    ws.getCell(r, 10).numFmt = '0.###';
    ws.getCell(r, 12).numFmt = BRL_FMT;
    ws.getCell(r, 12).alignment = { horizontal: 'right', vertical: 'middle' };
    if (ratio !== null) ws.getCell(r, 13).numFmt = PCT_FMT;
    box(ws, r);
  }

  spacer(ws, 4);

  // Total
  {
    const row = ws.addRow(['TOTAL DA BONIFICAÇÃO']);
    const r = row.number;
    ws.mergeCells(r, 1, r, 11);
    const lbl = ws.getCell(r, 1);
    lbl.font = { ...FONT, bold: true };
    lbl.fill = fill(GREY_LABEL);
    lbl.alignment = { horizontal: 'right', vertical: 'middle' };

    ws.getCell(r, 12).value = totalBonif;
    ws.getCell(r, 13).value =
      valorPedido > 0 ? totalBonif / valorPedido : '-';
    for (const col of [12, 13]) {
      const x = ws.getCell(r, col);
      x.font = { ...FONT, bold: true, color: { argb: 'FFFFFFFF' } };
      x.fill = fill(DARK);
      x.alignment = { horizontal: 'right', vertical: 'middle' };
    }
    ws.getCell(r, 12).numFmt = BRL_FMT;
    if (valorPedido > 0) ws.getCell(r, 13).numFmt = PCT_FMT;
    box(ws, r);
  }

  return wb;
}

export async function exportBonificacao(bonif, cliente, vendedor, supervisor) {
  const wb = await buildBonificacaoWorkbook(bonif, cliente, vendedor, supervisor);
  const buf = await wb.xlsx.writeBuffer();
  const clienteName = (cliente?.nomeFantasia || cliente?.razaoSocial || 'Cliente')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 30);
  downloadBlob(
    buf,
    `Bonificacao_${clienteName}_${todayISO().replace(/-/g, '')}.xlsx`,
    XLSX_MIME
  );
}
