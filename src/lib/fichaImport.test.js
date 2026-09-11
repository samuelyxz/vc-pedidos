import { describe, it, expect, beforeAll } from 'vitest';
import { lerFichaDeArquivo } from './fichaImport.js';
import { montarFichaCadastro, normalizarTexto } from './ficha.js';
import { montarFichaMassa } from './fichaMassa.js';
import { FICHA_XLSB_B64 } from '../data/fichaTemplate.js';

const FORM = {
  cnpj: '65.715.049/0001-76',
  ie: '562.778.612.111',
  razaoSocial: 'Mercado Triunfo Prudente Ltda',
  nomeFantasia: 'Mercado Triunfo',
  nomeAbrev: 'M TRIUNFO',
  logradouro: 'Rua José Quirino da Silva',
  numero: '258',
  bairro: 'Jardim Leonor',
  cep: '19.026-795',
  municipio: 'Presidente Prudente',
  estado: 'SP',
  telefone: '(18) 9701-3200',
  fin_nome: 'Vera Lúcia',
  fin_email: 'veralucia@gmail.com',
  banco: 'SANTANDER',
  agencia: '0033',
  conta: '130153704',
  resp_vendas: 'ALA REP',
  filial: 'N',
  tabela_preco: 'ANGELONI',
  edi: 'N',
  frete: 'CIF',
  limite_credito: 'R$ 5.000,00',
  prazo_pagamento: '28D',
  forma_pagamento: 'BOLETO',
};

/** Simula o File que o input devolve. */
const comoArquivo = (bytes, name = 'ficha.xlsb') => ({
  name,
  arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
});

/** @type {Record<string, string>} */
let lida;

beforeAll(async () => {
  lida = await lerFichaDeArquivo(comoArquivo(await montarFichaCadastro(FORM)));
});

describe('lerFichaDeArquivo', () => {
  it('traz de volta o que foi gerado, campo a campo', () => {
    for (const [campo, valor] of Object.entries(FORM)) {
      expect(`${campo}=${lida[campo]}`).toBe(`${campo}=${normalizarTexto(valor)}`);
    }
  });

  it('recupera os campos de lista escolhidos', () => {
    expect(lida.banco).toBe('SANTANDER');
    expect(lida.resp_vendas).toBe('ALA REP');
    expect(lida.tabela_preco).toBe('ANGELONI');
    expect(lida.forma_pagamento).toBe('BOLETO');
  });

  it('campo de lista não escolhido volta vazio, não como "Selecionar"', async () => {
    const semListas = { ...FORM };
    delete semListas.banco;
    delete semListas.tabela_preco;
    const r = await lerFichaDeArquivo(
      comoArquivo(await montarFichaCadastro(semListas))
    );
    expect(r.banco).toBe('');
    expect(r.tabela_preco).toBe('');
  });

  it('a ficha importada gera um arquivo igual ao original', async () => {
    // ida e volta: o que sai da releitura tem que produzir a mesma planilha
    const denovo = await lerFichaDeArquivo(
      comoArquivo(await montarFichaCadastro(lida))
    );
    expect(denovo).toEqual(lida);
  });

  it('recusa o modelo em branco, que não tem o que importar', async () => {
    const branco = Uint8Array.from(atob(FICHA_XLSB_B64), (c) =>
      c.charCodeAt(0)
    );
    await expect(lerFichaDeArquivo(comoArquivo(branco))).rejects.toThrow(
      /em branco/i
    );
  });

  it('explica quando recebe a ficha em massa por engano', async () => {
    const massa = await montarFichaMassa([FORM]);
    await expect(lerFichaDeArquivo(comoArquivo(massa))).rejects.toThrow(
      /modelo em massa/i
    );
  });

  it('recusa arquivo que não é planilha', async () => {
    const lixo = new TextEncoder().encode('isso aqui não é planilha nenhuma');
    await expect(lerFichaDeArquivo(comoArquivo(lixo))).rejects.toThrow();
  });
});
