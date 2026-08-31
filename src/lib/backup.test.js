import { describe, it, expect, beforeEach } from 'vitest';
import { store } from './storage.js';
import { collectBackup, normalizeBackup, applyBackup, BACKUP_KEYS } from './backup.js';

beforeEach(async () => {
  for (const k of BACKUP_KEYS) await store.delete(k);
});

describe('collectBackup', () => {
  it('empacota só as chaves que têm dado', async () => {
    await store.set('clientes', [{ id: '1', razaoSocial: 'ACME' }]);
    await store.set('supervisor', 'Estela');
    const pkg = await collectBackup();
    expect(pkg._app).toBe('vc-pedidos');
    expect(Object.keys(pkg.data).sort()).toEqual(['clientes', 'supervisor']);
    expect(pkg.data.clientes[0].razaoSocial).toBe('ACME');
  });
});

describe('normalizeBackup', () => {
  it('aceita o formato empacotado { data: {...} }', () => {
    const out = normalizeBackup({ data: { pedidos: [{ id: 'p1' }], lixo: 1 } });
    expect(out).toEqual({ pedidos: [{ id: 'p1' }] });
  });

  it('aceita dump cru do localStorage (valores string)', () => {
    const out = normalizeBackup({
      clientes: '[{"id":"1"}]',
      supervisor: 'Estela',
      naoReconhecida: 'x',
    });
    expect(out.clientes).toEqual([{ id: '1' }]);
    expect(out.supervisor).toBe('Estela');
    expect(out).not.toHaveProperty('naoReconhecida');
  });

  it('rejeita arquivo sem nenhuma chave conhecida', () => {
    expect(() => normalizeBackup({ foo: 1 })).toThrow(/Nenhum dado reconhecido/i);
  });

  it('rejeita entrada que não é objeto', () => {
    expect(() => normalizeBackup(null)).toThrow(/inválido/i);
    expect(() => normalizeBackup([1, 2])).toThrow(/inválido/i);
  });
});

describe('applyBackup', () => {
  it('grava no store e ignora chaves desconhecidas', async () => {
    const keys = await applyBackup({
      data: {
        clientes: [{ id: 'c1', razaoSocial: 'X' }],
        pedidos: [{ id: 'o1' }],
        hackzor: 'nope',
      },
    });
    expect(keys.sort()).toEqual(['clientes', 'pedidos']);
    expect(await store.get('clientes')).toEqual([{ id: 'c1', razaoSocial: 'X' }]);
    expect(await store.get('pedidos')).toEqual([{ id: 'o1' }]);
  });

  it('round-trip: collect -> apply reconstrói os dados', async () => {
    await store.set('bonificacoes', [{ id: 'b1', motivo: 'degustação' }]);
    await store.set('vendedor', { nome: 'Samuel' });
    const pkg = await collectBackup();

    for (const k of BACKUP_KEYS) await store.delete(k);
    await applyBackup(pkg);

    expect(await store.get('bonificacoes')).toEqual([
      { id: 'b1', motivo: 'degustação' },
    ]);
    expect(await store.get('vendedor')).toEqual({ nome: 'Samuel' });
  });
});
