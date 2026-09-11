import { describe, it, expect, beforeAll } from 'vitest';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import {
  montarFichaMassa,
  nomeArquivoMassa,
  MAX_CLIENTES,
} from './fichaMassa.js';
import { FICHA_MASSA_B64 } from '../data/fichaMassaTemplate.js';

const ABA_CLIENTES = 'CLIENTES DATASUL ';

const unidade = (nome, abrev, cnpj, cidade) => ({
  razaoSocial: nome,
  nomeFantasia: nome,
  nomeAbrev: abrev,
  cnpj,
  ie: '123456789',
  suframa: '',
  logradouro: 'Avenida Brasil',
  numero: '100',
  bairro: 'Centro',
  municipio: cidade,
  estado: 'SP',
  cep: '19000-000',
  complemento: '',
  cob_logradouro: 'Avenida Brasil',
  cob_numero: '100',
  cob_bairro: 'Centro',
  cob_municipio: cidade,
  cob_estado: 'SP',
  cob_cep: '19000-000',
  cob_complemento: 'Sala 1',
  cob_telefone: '(18) 3222-1111',
  ent_logradouro: 'Rua da Entrega',
  ent_numero: '200',
  ent_bairro: 'Distrito',
  ent_municipio: cidade,
  ent_estado: 'SP',
  ent_cep: '19010-000',
  ent_complemento: '',
  ent_telefone: '(18) 3222-2222',
  fin_nome: 'Maria de Fátima',
  fin_telefone: '(18) 99999-0000',
  fin_email: 'financeiro@teste.com.br',
  email_nf: 'nf@teste.com.br',
  banco: 'SICREDI',
  agencia: '0710',
  conta: '12345-6',
  resp_vendas: 'ALA REP',
  tabela_preco: 'ANGELONI',
  edi: 'N',
  frete: 'CIF',
  limite_credito: '25000',
  prazo_pagamento: '28/35D',
  forma_pagamento: 'BOLETO',
  forn1: 'Distribuidora Açúcar',
  forn2: '',
  forn3: '',
});

const CLIENTES = [
  unidade('Mercado Triunfo Ltda', 'TRIUNFO MTZ', '11.111.111/0001-11', 'Presidente Prudente'),
  unidade('Mercado Triunfo Filial 01', 'TRIUNFO F01', '11.111.111/0002-92', 'Alvares Machado'),
  unidade('Mercado Triunfo Filial 02', 'TRIUNFO F02', '11.111.111/0003-73', 'Regente Feijo'),
];

/** @type {Uint8Array} */
let gerada;
/** @type {import('xlsx').WorkBook} */
let wb;

beforeAll(async () => {
  gerada = await montarFichaMassa(CLIENTES);
  wb = XLSX.read(gerada, { type: 'array', cellFormula: true });
});

const texto = (aba, ref) => {
  const c = wb.Sheets[aba][ref];
  return c ? String(c.w ?? c.v ?? '') : '';
};

describe('montarFichaMassa — aba de preenchimento', () => {
  it('mantém as quatro abas do modelo', () => {
    expect(wb.SheetNames).toEqual([
      ABA_CLIENTES,
      'Orientações Preenchimento',
      'Base',
      'Template',
    ]);
  });

  it('põe um cliente por linha, a partir da linha 5', () => {
    expect(texto(ABA_CLIENTES, 'E5')).toBe('MERCADO TRIUNFO LTDA');
    expect(texto(ABA_CLIENTES, 'E6')).toBe('MERCADO TRIUNFO FILIAL 01');
    expect(texto(ABA_CLIENTES, 'E7')).toBe('MERCADO TRIUNFO FILIAL 02');
  });

  it('escreve cada campo na coluna certa', () => {
    expect(texto(ABA_CLIENTES, 'B5')).toBe('11.111.111/0001-11');
    expect(texto(ABA_CLIENTES, 'G5')).toBe('TRIUNFO MTZ');
    expect(texto(ABA_CLIENTES, 'H5')).toBe('ALA REP');
    expect(texto(ABA_CLIENTES, 'J5')).toBe('SICREDI');
    expect(texto(ABA_CLIENTES, 'L5')).toBe('0710');
    expect(texto(ABA_CLIENTES, 'Q5')).toBe('PRESIDENTE PRUDENTE');
    expect(texto(ABA_CLIENTES, 'AM5')).toBe('FINANCEIRO@TESTE.COM.BR');
    expect(texto(ABA_CLIENTES, 'AZ5')).toBe('ANGELONI');
    expect(texto(ABA_CLIENTES, 'BC5')).toBe('BOLETO');
  });

  it('preenche os códigos de banco e representante em todas as linhas', () => {
    // a planilha só tem a fórmula do representante na primeira linha, e a do
    // banco está quebrada em duas outras — por isso gravamos o valor
    for (const linha of [5, 6, 7]) {
      expect(`I${linha}=${texto(ABA_CLIENTES, `I${linha}`)}`).toBe(
        `I${linha}=54434`
      );
      expect(`K${linha}=${texto(ABA_CLIENTES, `K${linha}`)}`).toBe(
        `K${linha}=748`
      );
    }
  });

  it('sai em maiúscula e sem acento', () => {
    expect(texto(ABA_CLIENTES, 'AK5')).toBe('MARIA DE FATIMA');
    expect(texto(ABA_CLIENTES, 'AO5')).toBe('DISTRIBUIDORA ACUCAR');
  });
});

describe('montarFichaMassa — aba de importação', () => {
  it('completa as linhas que o modelo deixou sem fórmula', () => {
    // o modelo só monta a linha 2 (cliente 1); 3 e 4 vinham praticamente vazias
    expect(texto('Template', 'C3')).toBe('MERCADO TRIUNFO FILIAL 01');
    expect(texto('Template', 'AP3')).toBe('11.111.111/0002-92');
    expect(texto('Template', 'B3')).toBe('TRIUNFO F01');
    expect(texto('Template', 'L3')).toBe('748');
    expect(texto('Template', 'F3')).toBe('54434');
    expect(texto('Template', 'AL3')).toBe('ANGELONI');
    expect(texto('Template', 'V3')).toBe('ALVARES MACHADO');
  });

  it('junta logradouro e número igual a fórmula original', () => {
    expect(texto('Template', 'T3')).toBe('AVENIDA BRASIL,100');
    expect(texto('Template', 'AA3')).toBe('AVENIDA BRASIL,100');
  });

  it('não mexe na linha do primeiro cliente, que já tem fórmula', () => {
    expect(wb.Sheets['Template'].C2.f).toContain('CLIENTES DATASUL');
    expect(wb.Sheets['Template'].AP2.f).toContain('CLIENTES DATASUL');
  });

  it('mantém a caixa dos códigos de sistema', () => {
    // "Cb Simples" é valor que o sistema deles espera, não texto do cliente:
    // subir para maiúscula quebraria a importação
    expect(texto('Template', 'K3')).toBe('Cb Simples');
    expect(texto('Template', 'K4')).toBe('Cb Simples');
  });

  it('usa Carteira quando a forma de pagamento é depósito', async () => {
    const outra = await montarFichaMassa([
      CLIENTES[0],
      { ...CLIENTES[1], forma_pagamento: 'DEPOSITO' },
    ]);
    const w = XLSX.read(outra, { type: 'array' });
    expect(String(w.Sheets['Template'].K3.v)).toBe('Carteira');
  });

  it('marca ICMS conforme a inscrição estadual', async () => {
    const outra = await montarFichaMassa([
      CLIENTES[0],
      { ...CLIENTES[1], ie: 'ISENTO' },
      { ...CLIENTES[2], ie: '' },
    ]);
    const w = XLSX.read(outra, { type: 'array' });
    expect(String(w.Sheets['Template'].BG3.v)).toBe('N');
    expect(String(w.Sheets['Template'].BG4.v ?? '')).toBe('');
  });

  it('com um cliente só, não escreve nada na aba de importação', async () => {
    const uma = await montarFichaMassa([CLIENTES[0]]);
    const w = XLSX.read(uma, { type: 'array', cellFormula: true });
    // a linha 2 continua sendo a fórmula do modelo
    expect(w.Sheets['Template'].C2.f).toContain('CLIENTES DATASUL');
  });
});

describe('montarFichaMassa — integridade do arquivo', () => {
  it('só toca nas duas abas e nos índices que ficam inválidos', async () => {
    const antes = await JSZip.loadAsync(
      Uint8Array.from(atob(FICHA_MASSA_B64), (c) => c.charCodeAt(0))
    );
    const depois = await JSZip.loadAsync(gerada);
    const partes = (z) =>
      Object.keys(z.files)
        .filter((n) => !z.files[n].dir)
        .sort();

    expect(partes(antes).filter((n) => !partes(depois).includes(n))).toEqual([
      'xl/calcChain.bin',
      'xl/worksheets/binaryIndex1.bin',
      'xl/worksheets/binaryIndex4.bin',
    ]);

    const alteradas = [];
    for (const nome of partes(depois)) {
      const a = await antes.file(nome).async('uint8array');
      const b = await depois.file(nome).async('uint8array');
      if (a.length !== b.length || a.some((v, i) => v !== b[i])) {
        alteradas.push(nome);
      }
    }
    expect(alteradas.sort()).toEqual([
      '[Content_Types].xml',
      'xl/_rels/workbook.bin.rels',
      'xl/worksheets/_rels/sheet1.bin.rels',
      'xl/worksheets/_rels/sheet4.bin.rels',
      'xl/worksheets/sheet1.bin',
      'xl/worksheets/sheet4.bin',
    ]);
  });

  it('recusa lista vazia', async () => {
    await expect(montarFichaMassa([])).rejects.toThrow(/pelo menos um/i);
  });

  it('não passa do limite de linhas do modelo', async () => {
    const muitos = Array.from({ length: MAX_CLIENTES + 5 }, (_, i) =>
      unidade(`Cliente ${i}`, `C${i}`, `${i}`, 'Cidade')
    );
    const bytes = await montarFichaMassa(muitos);
    const w = XLSX.read(bytes, { type: 'array' });
    const ultima = 5 + MAX_CLIENTES - 1;
    expect(String(w.Sheets[ABA_CLIENTES][`E${ultima}`].v)).toContain('CLIENTE');
    expect(w.Sheets[ABA_CLIENTES][`E${ultima + 1}`]?.v ?? '').toBe('');
  });
});

describe('nomeArquivoMassa', () => {
  it('usa o primeiro cliente e a quantidade', () => {
    expect(nomeArquivoMassa(CLIENTES)).toBe(
      'Ficha_Cadastro_EM_MASSA_MERCADO_TRIUNFO_LTDA_3_CLIENTES.xlsb'
    );
  });
});
