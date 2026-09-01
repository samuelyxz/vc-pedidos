import { describe, it, expect, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import { setProducts } from './catalog.js';
import { buildBonificacaoWorkbook } from './exportBonificacao.js';

const P1 = {
  codigo: '80.111.0001',
  nome: 'REQUEIJAO TESTE 180G',
  descricao_original: 'REQUEIJAO TESTE 180G VC CX 12',
  un_cx: 12,
  preco_st: 100,
  unidade: 'CX',
  peso_kg: 0,
};
const P2 = {
  codigo: '80.222.0002',
  nome: 'QUEIJO TESTE',
  descricao_original: 'QUEIJO TESTE VC 3KG',
  un_cx: 6,
  preco_st: 50,
  unidade: 'KG',
  peso_kg: 3,
};

beforeEach(() => setProducts([P1, P2]));

const bonif = {
  data: '2026-09-01',
  numeroPedido: '39200',
  valorPedido: '1000',
  mediaRSL: '800',
  motivo: 'Degustação em ponto de venda',
  items: [
    { codigo: '80.111.0001', qtd: 2 },
    { codigo: '80.222.0002', qtd: 1 },
  ],
};
const cliente = {
  razaoSocial: 'ACME LTDA',
  nomeFantasia: 'ACME',
  codCliente: 'C123',
  rede: 'Rede X',
};
const vendedor = { nome: 'Samuel' };

async function roundtrip() {
  const wb = await buildBonificacaoWorkbook(bonif, cliente, vendedor, 'Estela');
  const buf = await wb.xlsx.writeBuffer();
  const reloaded = new ExcelJS.Workbook();
  await reloaded.xlsx.load(buf);
  return reloaded.getWorksheet('Bonificação');
}

describe('buildBonificacaoWorkbook', () => {
  it('gera um .xlsx válido com a aba Bonificação', async () => {
    const ws = await roundtrip();
    expect(ws).toBeTruthy();
    expect(String(ws.getCell('A1').value)).toContain('BONIFICAÇÃO');
  });

  it('lista supervisor, vendedor, motivo e os produtos', async () => {
    const ws = await roundtrip();
    const flat = [];
    ws.eachRow((row) => row.eachCell((c) => flat.push(c.text)));
    const joined = flat.join(' | ');
    expect(joined).toContain('Estela');
    expect(joined).toContain('Samuel');
    expect(joined).toContain('Degustação em ponto de venda');
    expect(joined).toContain('REQUEIJAO TESTE 180G VC CX 12');
    expect(joined).toContain('80.222.0002');
  });

  it('linha de total: valor numérico + percentual sobre o pedido', async () => {
    const ws = await roundtrip();
    let row = null;
    ws.eachRow((rw) => {
      if (rw.getCell(1).text === 'TOTAL DA BONIFICAÇÃO') row = rw;
    });
    expect(row).not.toBeNull();
    // 2*100 + 1*50 = 250
    expect(row.getCell(12).value).toBeCloseTo(250);
    expect(row.getCell(12).numFmt).toMatch(/R\$/);
    // 250 / 1000 = 0.25 (formato de porcentagem)
    expect(row.getCell(13).value).toBeCloseTo(0.25);
    expect(row.getCell(13).numFmt).toMatch(/%/);
  });

  it('sem valor de pedido, o percentual vira "-"', async () => {
    const wb = await buildBonificacaoWorkbook(
      { ...bonif, valorPedido: '' },
      cliente,
      vendedor,
      'Estela'
    );
    const buf = await wb.xlsx.writeBuffer();
    const reloaded = new ExcelJS.Workbook();
    await reloaded.xlsx.load(buf);
    const ws = reloaded.getWorksheet('Bonificação');
    let row = null;
    ws.eachRow((rw) => {
      if (rw.getCell(1).text === 'TOTAL DA BONIFICAÇÃO') row = rw;
    });
    expect(row.getCell(13).text).toBe('-');
  });
});
