import { describe, it, expect, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import { setProducts } from './catalog.js';
import { buildPedidoWorkbook } from './exportPedido.js';

const PROD_CX = {
  codigo: '80.111.0001',
  sap: '2100',
  ean: '789',
  secao: 'PASTAS',
  nome: 'REQUEIJAO TESTE 180G',
  un_cx: 12,
  preco_st: 100,
  unidade: 'CX',
  peso_kg: 0,
};
const PROD_KG = {
  codigo: '80.222.0002',
  sap: '2200',
  ean: '790',
  secao: 'QUEIJO MUSSARELA',
  nome: 'QUEIJO MUSSARELA TESTE',
  un_cx: 6,
  preco_st: 50,
  unidade: 'KG',
  peso_kg: 4,
};

beforeEach(() => setProducts([PROD_CX, PROD_KG]));

const pedido = {
  numero: '39200',
  data: '2026-09-01',
  obs: 'Entregar pela manhã',
  items: [
    { codigo: '80.111.0001', caixas: 3, bonif: 1, descPct: 10, isExtra: false },
    { codigo: '80.222.0002', caixas: 2, bonif: 0, descPct: 0, isExtra: true, obs: 'lote novo' },
  ],
};
const cliente = { razaoSocial: 'ACME LTDA', cnpj: '00.000.000/0001-00', cidade: 'Lavras', uf: 'MG' };
const vendedor = { nome: 'Samuel', telefone: '35999', email: 's@x.com' };

async function roundtrip() {
  const wb = await buildPedidoWorkbook(pedido, cliente, vendedor);
  const buf = await wb.xlsx.writeBuffer();
  const reloaded = new ExcelJS.Workbook();
  await reloaded.xlsx.load(buf);
  return reloaded.getWorksheet('Pedido');
}

describe('buildPedidoWorkbook', () => {
  it('gera um .xlsx válido com a aba Pedido', async () => {
    const ws = await roundtrip();
    expect(ws).toBeTruthy();
    expect(String(ws.getCell('A1').value)).toContain('PEDIDO DE VENDA');
    expect(String(ws.getCell('A1').value)).toContain('39200');
  });

  it('inclui os códigos e o nome dos produtos', async () => {
    const ws = await roundtrip();
    const flat = [];
    ws.eachRow((row) => row.eachCell((c) => flat.push(c.text)));
    expect(flat.join(' | ')).toContain('80.111.0001');
    expect(flat.join(' | ')).toContain('REQUEIJAO TESTE 180G');
    expect(flat.join(' | ')).toContain('QUEIJO MUSSARELA TESTE');
  });

  it('a linha de total traz o valor numérico com formato de moeda', async () => {
    const ws = await roundtrip();
    let totalCell = null;
    ws.eachRow((row) => {
      row.eachCell((c) => {
        if (c.value === 'TOTAL DO PEDIDO') totalCell = row.getCell(11);
      });
    });
    // CX: 3 * 100 * 0.9 = 270 ; KG: 2 * 4 * 50 = 400  -> 670
    expect(totalCell).not.toBeNull();
    expect(totalCell.value).toBeCloseTo(670);
    expect(totalCell.numFmt).toMatch(/R\$/);
  });

  it('destaca a linha do item extra com preenchimento amarelo', async () => {
    const ws = await roundtrip();
    let found = false;
    ws.eachRow((row) => {
      const first = row.getCell(1);
      if (first.text === '2200') {
        const fillArgb = row.getCell(1).fill?.fgColor?.argb;
        if (fillArgb === 'FFFFF5CC') found = true;
      }
    });
    expect(found).toBe(true);
  });

  it('mostra as observações do pedido', async () => {
    const ws = await roundtrip();
    const flat = [];
    ws.eachRow((row) => row.eachCell((c) => flat.push(c.text)));
    expect(flat).toContain('Entregar pela manhã');
  });
});
