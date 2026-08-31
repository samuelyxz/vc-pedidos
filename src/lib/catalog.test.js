import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parsePriceTable, mergeProducts } from './catalog.js';

// Cria um "File-like" com arrayBuffer() a partir de linhas de planilha.
function fakeXlsx(rows, sheetName = 'Export') {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return { arrayBuffer: async () => buf };
}

describe('parsePriceTable', () => {
  it('lê as colunas mínimas e deriva nome / un_cx / categoria', async () => {
    const file = fakeXlsx([
      {
        Código: '80.999.0001',
        Descrição: 'IOG TESTE MORANGO VC 500G CX 12',
        'Preço com ST': 123.45,
      },
    ]);
    const out = await parsePriceTable(file);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      codigo: '80.999.0001',
      un_cx: 12,
      preco_st: 123.45,
      nome: 'IOG TESTE MORANGO 500G',
      categoria: 'IOGURTE',
    });
  });

  it('ignora linhas sem preço válido', async () => {
    const file = fakeXlsx([
      { Código: 'A', Descrição: 'PROD A CX 6', 'Preço com ST': 0 },
      { Código: 'B', Descrição: 'PROD B CX 6', 'Preço com ST': 10 },
    ]);
    const out = await parsePriceTable(file);
    expect(out.map((p) => p.codigo)).toEqual(['B']);
  });

  it('rejeita planilha sem as colunas obrigatórias', async () => {
    const file = fakeXlsx([{ Foo: 1, Bar: 2 }]);
    await expect(parsePriceTable(file)).rejects.toThrow(/Colunas obrigat/i);
  });
});

describe('mergeProducts', () => {
  it('preserva SAP/EAN/peso/categoria do catálogo antigo', () => {
    const nova = [
      { codigo: 'X', nome: 'X', preco_st: 10, un_cx: 12, categoria: 'IOGURTE' },
    ];
    const antiga = [
      { codigo: 'X', sap: '123', ean: '456', peso_kg: 5, unidade: 'KG', categoria: 'QUEIJO' },
    ];
    const [m] = mergeProducts(nova, antiga);
    expect(m).toMatchObject({ sap: '123', ean: '456', peso_kg: 5, unidade: 'KG', categoria: 'QUEIJO' });
    expect(m.preco_st).toBe(10); // preço vem sempre da tabela nova
  });

  it('marca produto que não existia como NOVO', () => {
    const [m] = mergeProducts(
      [{ codigo: 'NEW', nome: 'Lançamento', preco_st: 9, un_cx: 12 }],
      [],
    );
    expect(m.status).toBe('NOVO');
    expect(m.sap).toBe('');
  });
});
