// Primitivos compartilhados para gerar planilhas .xlsx com exceljs.
export const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

// Bags de estilo do exceljs — tipagem propria do lib e restritiva demais pra
// literais; tratamos como `any` na fronteira (a logica continua checada).
/** @type {any} */
export const FONT = { name: 'Calibri', size: 10 };
/** @type {any} */
export const MONO = { name: 'Consolas', size: 9.5 };
export const BRL_FMT = '"R$" #,##0.00';

export const argb = (hex) => 'FF' + hex;
/** @returns {any} */
export const fill = (hex) => ({
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: argb(hex) },
});

const thin = { style: 'thin', color: { argb: 'FF888888' } };
export const BORDER = { top: thin, left: thin, bottom: thin, right: thin };

export function outline(ws, r, c1, c2) {
  for (let c = c1; c <= c2; c++) ws.getCell(r, c).border = BORDER;
}

export function spacer(ws, height = 6) {
  ws.addRow([]).height = height;
}

// Linha que ocupa a largura toda (título, seção, rodapé).
export function bannerRow(ws, ncols, text, bgHex, opts = {}) {
  const row = ws.addRow([text]);
  const r = row.number;
  ws.mergeCells(r, 1, r, ncols);
  const cell = ws.getCell(r, 1);
  cell.font = {
    ...FONT,
    bold: opts.bold !== false,
    size: opts.size || 10,
    italic: !!opts.italic,
    color: { argb: opts.color || 'FFFFFFFF' },
  };
  cell.fill = fill(bgHex);
  cell.alignment = {
    horizontal: opts.align || 'center',
    vertical: 'middle',
    wrapText: !!opts.wrap,
  };
  outline(ws, r, 1, ncols);
  if (opts.height) row.height = opts.height;
  return r;
}

export async function loadExcelJS() {
  return (await import('exceljs')).default;
}
