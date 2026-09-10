import { describe, it, expect, beforeEach } from 'vitest';
import {
  listarFichas,
  salvarFicha,
  excluirFicha,
  paraFilial,
  rotuloFicha,
} from './fichasSalvas.js';
import { store } from './storage.js';

beforeEach(async () => {
  await store.delete('fichas');
});

const matriz = {
  razaoSocial: 'Supermercado São João Ltda',
  nomeFantasia: 'Mercado São João',
  nomeAbrev: 'MERC S JOAO',
  cnpj: '11.111.111/0001-11',
  ie: '123456',
  suframa: '',
  logradouro: 'Avenida Brasil',
  numero: '100',
  bairro: 'Centro',
  cep: '19000-000',
  municipio: 'Presidente Prudente',
  estado: 'SP',
  telefone: '(18) 3222-1111',
  cob_logradouro: 'Avenida Brasil',
  ent_logradouro: 'Avenida Brasil',
  banco: 'SICREDI',
  agencia: '0710',
  conta: '12345-6',
  resp_vendas: 'ALA REP',
  tabela_preco: 'ANGELONI',
  forma_pagamento: 'BOLETO',
  forn1: 'Distribuidora A',
  filial: '',
};

describe('histórico de fichas', () => {
  it('começa vazio', async () => {
    expect(await listarFichas()).toEqual([]);
  });

  it('guarda a ficha inteira, campos bancários incluídos', async () => {
    await salvarFicha(matriz);
    const [f] = await listarFichas();
    expect(f.form.razaoSocial).toBe('Supermercado São João Ltda');
    expect(f.form.banco).toBe('SICREDI');
    expect(f.form.conta).toBe('12345-6');
    expect(f.id).toBeTruthy();
    expect(f.criadoEm).toBeTruthy();
  });

  it('com id, atualiza a mesma ficha em vez de criar outra', async () => {
    const criada = await salvarFicha(matriz);
    await salvarFicha({ ...matriz, agencia: '9999' }, criada.id);
    const lista = await listarFichas();
    expect(lista).toHaveLength(1);
    expect(lista[0].id).toBe(criada.id);
    expect(lista[0].form.agencia).toBe('9999');
    expect(lista[0].criadoEm).toBe(criada.criadoEm);
  });

  it('sem id, cada geração vira uma ficha nova', async () => {
    await salvarFicha(matriz);
    await salvarFicha({ ...matriz, cnpj: '22.222.222/0001-22' });
    expect(await listarFichas()).toHaveLength(2);
  });

  it('lista da mais recente para a mais antiga', async () => {
    const antiga = await salvarFicha({ ...matriz, razaoSocial: 'Antiga' });
    // salvarFicha carimba a hora; forçamos a ordem para o teste não depender
    // da máquina ser rápida demais
    const lista = await listarFichas();
    await store.set('fichas', [
      { ...lista[0], atualizadoEm: '2026-01-01T00:00:00.000Z' },
    ]);
    await salvarFicha({ ...matriz, razaoSocial: 'Nova' });
    const ordenada = await listarFichas();
    expect(ordenada.map((f) => f.form.razaoSocial)).toEqual([
      'Nova',
      'Antiga',
    ]);
    expect(ordenada[1].id).toBe(antiga.id);
  });

  it('excluir tira só a escolhida', async () => {
    const a = await salvarFicha({ ...matriz, razaoSocial: 'A' });
    await salvarFicha({ ...matriz, razaoSocial: 'B' });
    await excluirFicha(a.id);
    const lista = await listarFichas();
    expect(lista.map((f) => f.form.razaoSocial)).toEqual(['B']);
  });

  it('ignora lixo gravado na chave', async () => {
    await store.set('fichas', [null, { semForm: true }, 'texto']);
    expect(await listarFichas()).toEqual([]);
    await store.set('fichas', 'nem é lista');
    expect(await listarFichas()).toEqual([]);
  });
});

describe('paraFilial', () => {
  it('mantém o que é da empresa', () => {
    const f = paraFilial(matriz);
    expect(f.razaoSocial).toBe('Supermercado São João Ltda');
    expect(f.nomeFantasia).toBe('Mercado São João');
    expect(f.banco).toBe('SICREDI');
    expect(f.agencia).toBe('0710');
    expect(f.conta).toBe('12345-6');
    expect(f.resp_vendas).toBe('ALA REP');
    expect(f.tabela_preco).toBe('ANGELONI');
    expect(f.forma_pagamento).toBe('BOLETO');
    expect(f.forn1).toBe('Distribuidora A');
  });

  it('limpa o que muda em cada unidade', () => {
    const f = paraFilial(matriz);
    for (const campo of [
      'cnpj',
      'ie',
      'nomeAbrev',
      'logradouro',
      'numero',
      'bairro',
      'cep',
      'municipio',
      'estado',
      'telefone',
      'cob_logradouro',
      'ent_logradouro',
    ]) {
      expect(`${campo}=${f[campo]}`).toBe(`${campo}=`);
    }
  });

  it('já marca como filial', () => {
    expect(paraFilial(matriz).filial).toBe('S');
  });

  it('não altera a ficha de origem', () => {
    const copia = { ...matriz };
    paraFilial(matriz);
    expect(matriz).toEqual(copia);
  });
});

describe('rotuloFicha', () => {
  it('prefere a razão social', () => {
    expect(rotuloFicha(matriz)).toBe('Supermercado São João Ltda');
  });

  it('cai no fantasia e tem reserva', () => {
    expect(rotuloFicha({ nomeFantasia: 'Só Fantasia' })).toBe('Só Fantasia');
    expect(rotuloFicha({})).toBe('Ficha sem nome');
    expect(rotuloFicha(null)).toBe('Ficha sem nome');
  });
});
