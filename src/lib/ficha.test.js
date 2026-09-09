import { describe, it, expect, beforeAll } from 'vitest';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import {
  montarFichaCadastro,
  normalizarTexto,
  nomeArquivoFicha,
  FICHA_CELLS,
} from './ficha.js';
import { FICHA_XLSB_B64 } from '../data/fichaTemplate.js';
import { parseRef } from './biff12.js';

const FORM = {
  cnpj: '12.345.678/0001-90',
  ie: 'ISENTO',
  razaoSocial: 'Supermercado São João Ltda',
  nomeFantasia: 'Mercado São João',
  nomeAbrev: 'MERC S JOAO',
  logradouro: 'Avenida Brasil',
  numero: '1234',
  bairro: 'Centro',
  cep: '19000-000',
  municipio: 'Presidente Prudente',
  estado: 'SP',
  telefone: '(18) 3222-1111',
  cob_logradouro: 'Avenida Brasil',
  cob_estado: 'SP',
  ent_logradouro: 'Avenida Brasil',
  ent_estado: 'SP',
  fin_nome: 'Maria de Fátima',
  fin_email: 'financeiro@mercado.com.br',
  banco: 'BANCO BRADESCO',
  agencia: '1234',
  conta: '56789-0',
  resp_vendas: 'ALA REP',
  tabela_preco: 'ANGELONI',
  edi: 'N',
  frete: 'CIF',
  forma_pagamento: 'BOLETO',
  limite_credito: '10000',
  prazo_pagamento: '28D',
  filial: 'N',
  forn1: 'Distribuidora Açúcar & Cia',
};

/** @type {Uint8Array} */
let gerada;
/** @type {import('xlsx').WorkBook} */
let wb;

beforeAll(async () => {
  gerada = await montarFichaCadastro(FORM);
  wb = XLSX.read(gerada, { type: 'array', cellFormula: true });
});

const texto = (ws, ref) => {
  const c = ws[ref];
  return c ? String(c.w ?? c.v ?? '') : '';
};

describe('montarFichaCadastro', () => {
  it('mantém as quatro abas do modelo', () => {
    expect(wb.SheetNames).toEqual([
      'TEMPLATE INDIVIDUAL',
      'base',
      'FICHA INDIVIDUAL',
      'Orientações Preenchimento',
    ]);
  });

  it('escreve cada campo preenchido na célula certa, em maiúscula e sem acento', () => {
    const ws = wb.Sheets['FICHA INDIVIDUAL'];
    for (const [campo, ref] of Object.entries(FICHA_CELLS)) {
      if (!FORM[campo]) continue;
      expect(`${campo}=${texto(ws, ref)}`).toBe(
        `${campo}=${normalizarTexto(FORM[campo])}`
      );
    }
  });

  it('acentos e caixa somem de verdade no arquivo', () => {
    const ws = wb.Sheets['FICHA INDIVIDUAL'];
    expect(texto(ws, 'C12')).toBe('SUPERMERCADO SAO JOAO LTDA');
    expect(texto(ws, 'C45')).toBe('MARIA DE FATIMA');
    expect(texto(ws, 'C67')).toBe('DISTRIBUIDORA ACUCAR & CIA');
  });

  it('deixa em branco o que não foi preenchido', () => {
    const ws = wb.Sheets['FICHA INDIVIDUAL'];
    // suframa e as referências 2 e 3 não vieram no formulário
    for (const ref of ['C15', 'C68', 'C69']) expect(texto(ws, ref)).toBe('');
  });

  it('campo vazio vira string vazia, não célula em branco', () => {
    // A aba de importação faz =C24; numa célula realmente vazia o Excel
    // devolveria 0, e o cadastro sairia com "0" no complemento.
    const ws = wb.Sheets['FICHA INDIVIDUAL'];
    for (const ref of ['C15', 'C24', 'C68', 'C69']) {
      expect(ws[ref], `${ref} deveria existir`).toBeDefined();
      expect(ws[ref].t).toBe('s');
      expect(ws[ref].v).toBe('');
    }
  });

  it('campo de lista não preenchido continua em "Selecionar"', async () => {
    const semListas = { ...FORM };
    delete semListas.banco;
    delete semListas.tabela_preco;
    const outro = XLSX.read(await montarFichaCadastro(semListas), {
      type: 'array',
    });
    const ws = outro.Sheets['FICHA INDIVIDUAL'];
    expect(texto(ws, 'C50')).toBe('Selecionar');
    expect(texto(ws, 'C59')).toBe('Selecionar');
    // e os que foram preenchidos continuam valendo
    expect(texto(ws, 'C56')).toBe('ALA REP');
  });

  it('preserva as fórmulas que a planilha usa para se completar sozinha', () => {
    const ficha = wb.Sheets['FICHA INDIVIDUAL'];
    // código do banco e do representante saem de VLOOKUP na aba base
    expect(ficha.C51.f).toContain('VLOOKUP');
    expect(ficha.C57.f).toContain('VLOOKUP');
    // a aba que a Verde Campo importa continua apontando para a ficha
    const tpl = wb.Sheets['TEMPLATE INDIVIDUAL'];
    expect(tpl.C2.f).toContain('FICHA INDIVIDUAL');
    expect(tpl.AP2.f).toContain('FICHA INDIVIDUAL');
  });

  it('não encosta em nenhuma outra parte do arquivo', async () => {
    const antes = await JSZip.loadAsync(
      Uint8Array.from(atob(FICHA_XLSB_B64), (c) => c.charCodeAt(0))
    );
    const depois = await JSZip.loadAsync(gerada);

    const partes = (z) =>
      Object.keys(z.files)
        .filter((n) => !z.files[n].dir)
        .sort();

    // só o índice binário e o calcChain saem (o Excel refaz os dois)
    expect(partes(antes).filter((n) => !partes(depois).includes(n))).toEqual([
      'xl/calcChain.bin',
      'xl/worksheets/binaryIndex3.bin',
    ]);
    expect(partes(depois).filter((n) => !partes(antes).includes(n))).toEqual([]);

    const alteradas = [];
    for (const nome of partes(depois)) {
      const a = await antes.file(nome).async('uint8array');
      const b = await depois.file(nome).async('uint8array');
      if (a.length !== b.length || a.some((v, i) => v !== b[i])) {
        alteradas.push(nome);
      }
    }
    // logo, estilos, tema, abas 1/2/4 e comentários ficam byte a byte iguais
    expect(alteradas.sort()).toEqual([
      '[Content_Types].xml',
      'xl/_rels/workbook.bin.rels',
      'xl/worksheets/_rels/sheet3.bin.rels',
      'xl/worksheets/sheet3.bin',
    ]);
  });

  it('o logo continua dentro do arquivo', async () => {
    const zip = await JSZip.loadAsync(gerada);
    const png = await zip.file('xl/media/image1.png').async('uint8array');
    expect(png.length).toBeGreaterThan(0);
    expect(Array.from(png.slice(1, 4))).toEqual([0x50, 0x4e, 0x47]);
  });
});

describe('normalizarTexto', () => {
  it('tira acento, sobe pra maiúscula e apara as pontas', () => {
    expect(normalizarTexto('  Açaí Ltda ')).toBe('ACAI LTDA');
    expect(normalizarTexto('São José do Rio Prêto')).toBe(
      'SAO JOSE DO RIO PRETO'
    );
  });

  it('aguenta vazio, nulo e número', () => {
    expect(normalizarTexto(undefined)).toBe('');
    expect(normalizarTexto(null)).toBe('');
    expect(normalizarTexto(1234)).toBe('1234');
  });
});

describe('nomeArquivoFicha', () => {
  it('usa o fantasia, sem acento nem símbolo', () => {
    expect(nomeArquivoFicha({ nomeFantasia: 'Mercado São João' })).toBe(
      'Ficha_Cadastro_MERCADO_SAO_JOAO.xlsb'
    );
  });

  it('cai na razão social e tem um nome de reserva', () => {
    expect(nomeArquivoFicha({ razaoSocial: 'ABC Ltda' })).toBe(
      'Ficha_Cadastro_ABC_LTDA.xlsb'
    );
    expect(nomeArquivoFicha({})).toBe('Ficha_Cadastro_CLIENTE.xlsb');
  });
});

describe('parseRef', () => {
  it('converte referência em linha/coluna', () => {
    expect(parseRef('A1')).toEqual({ row: 1, col: 0 });
    expect(parseRef('C10')).toEqual({ row: 10, col: 2 });
    expect(parseRef('AA2')).toEqual({ row: 2, col: 26 });
  });

  it('recusa referência inválida', () => {
    expect(() => parseRef('10C')).toThrow(/inválida/i);
  });
});
