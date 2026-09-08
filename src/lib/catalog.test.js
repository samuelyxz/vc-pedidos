import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import {
  parsePriceTable,
  mergeProducts,
  backfillFromDefaults,
} from './catalog.js';
import { DEFAULT_PRODUCTS } from '../data/products.js';

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

describe('backfillFromDefaults', () => {
  const kids = DEFAULT_PRODUCTS.find((p) => p.codigo === '80.881.0001');

  it('preenche imagem/sap/ean vazios a partir da tabela embutida', () => {
    const salvo = [
      { ...kids, imagem: '', sap: '', ean: '', preco_st: 99.9 },
    ];
    const [out] = backfillFromDefaults(salvo);
    expect(out.imagem).toBe(kids.imagem);
    expect(out.imagem).toContain('verdecampo.com.br');
    expect(out.sap).toBe(kids.sap);
    expect(out.ean).toBe(kids.ean);
  });

  it('NÃO mexe em preço, un/cx, peso nem unidade do catálogo salvo', () => {
    const salvo = [
      {
        ...kids,
        imagem: '',
        preco_st: 99.9,
        un_cx: 6,
        peso_kg: 7,
        unidade: 'KG',
      },
    ];
    const [out] = backfillFromDefaults(salvo);
    expect(out.preco_st).toBe(99.9);
    expect(out.un_cx).toBe(6);
    expect(out.peso_kg).toBe(7);
    expect(out.unidade).toBe('KG');
  });

  it('não sobrescreve valores que já existem', () => {
    const salvo = [{ ...kids, imagem: 'https://minha/foto.png' }];
    const [out] = backfillFromDefaults(salvo);
    expect(out.imagem).toBe('https://minha/foto.png');
  });

  it('deixa intacto produto que não está na tabela embutida', () => {
    const salvo = [
      { codigo: 'ZZZ', nome: 'Só do upload', preco_st: 1, un_cx: 1, imagem: '' },
    ];
    const [out] = backfillFromDefaults(salvo);
    expect(out.imagem).toBe('');
    expect(out.nome).toBe('Só do upload');
  });
});
