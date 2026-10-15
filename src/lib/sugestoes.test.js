import { describe, it, expect, beforeEach } from 'vitest';
import { store } from './storage.js';
import { setProducts } from './catalog.js';
import {
  novaSugestao,
  listarSugestoes,
  salvarSugestao,
  excluirSugestao,
  duplicarSugestao,
  rotuloSugestao,
  separarItens,
} from './sugestoes.js';
import { LOCAL_KEYS } from './backup.js';

beforeEach(async () => {
  await store.delete('sugestoes');
  setProducts([{ codigo: 'A', nome: 'A', preco_st: 10, un_cx: 12 }]);
});

const item = (codigo, caixas = 2) => ({ codigo, caixas, bonif: 0, descPct: 0 });

describe('sugestões salvas', () => {
  it('salva e atualiza a mesma sugestão pelo id, sem duplicar', async () => {
    const s = { ...novaSugestao(), nome: 'Mix pequeno', items: [item('A')] };
    await salvarSugestao(s);
    await salvarSugestao({ ...s, items: [item('A', 5)] });

    const lista = await listarSugestoes();
    expect(lista).toHaveLength(1);
    expect(lista[0].items[0].caixas).toBe(5);
  });

  it('lista a mais recente primeiro', async () => {
    const velha = await salvarSugestao({ ...novaSugestao(), nome: 'Velha' });
    await new Promise((r) => setTimeout(r, 5));
    await salvarSugestao({ ...novaSugestao(), nome: 'Nova' });
    await new Promise((r) => setTimeout(r, 5));
    await salvarSugestao({ ...velha, nome: 'Velha editada' });

    expect((await listarSugestoes()).map((s) => s.nome)).toEqual([
      'Velha editada',
      'Nova',
    ]);
  });

  it('exclui só a escolhida', async () => {
    const a = await salvarSugestao({ ...novaSugestao(), nome: 'A' });
    await salvarSugestao({ ...novaSugestao(), nome: 'B' });
    await excluirSugestao(a.id);
    expect((await listarSugestoes()).map((s) => s.nome)).toEqual(['B']);
  });

  it('duplicar cria uma cópia independente', async () => {
    const original = await salvarSugestao({
      ...novaSugestao(),
      nome: 'Mix',
      items: [item('A')],
    });
    const copia = await duplicarSugestao(original);
    copia.items[0].caixas = 99;

    expect(copia.id).not.toBe(original.id);
    expect(copia.nome).toBe('Mix (cópia)');
    const salvaOriginal = (await listarSugestoes()).find((s) => s.id === original.id);
    expect(salvaOriginal.items[0].caixas).toBe(2);
  });

  it('separa produtos que saíram da tabela', () => {
    const { validos, fora } = separarItens([item('A'), item('SAIU')]);
    expect(validos.map((i) => i.codigo)).toEqual(['A']);
    expect(fora.map((i) => i.codigo)).toEqual(['SAIU']);
  });

  it('sem nome vira "Sugestão sem nome"', () => {
    expect(rotuloSugestao({ nome: '  ' })).toBe('Sugestão sem nome');
  });

  it('entra no backup', () => {
    expect(LOCAL_KEYS).toContain('sugestoes');
  });
});
