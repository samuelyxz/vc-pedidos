import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { CatalogProvider, useCatalog } from './CatalogContext.jsx';
import { findProduct, PRODUCTS } from '../lib/catalog.js';
import { store } from '../lib/storage.js';
import { DEFAULT_PRODUCTS } from '../data/products.js';

afterEach(cleanup);
beforeEach(async () => {
  for (const k of ['catalogo', 'catalogo_meta', 'product_images']) {
    await store.delete(k);
  }
});

const wrapper = ({ children }) => <CatalogProvider>{children}</CatalogProvider>;

async function mount() {
  const { result } = renderHook(() => useCatalog(), { wrapper });
  await waitFor(() => expect(result.current.ready).toBe(true));
  return result;
}

describe('CatalogProvider', () => {
  it('começa com a tabela embutida', async () => {
    const r = await mount();
    expect(r.current.products).toHaveLength(DEFAULT_PRODUCTS.length);
    expect(r.current.catMeta.source).toBe('default');
  });

  it('updateCatalog troca os produtos, persiste e sincroniza o singleton', async () => {
    const r = await mount();
    const novo = [{ codigo: 'Z9', nome: 'Produto Teste', preco_st: 1, un_cx: 1 }];
    await act(async () => {
      await r.current.updateCatalog(novo, 'tabela.xlsx');
    });
    expect(r.current.products).toHaveLength(1);
    expect(r.current.catMeta.source).toBe('upload');
    // singleton usado pelos helpers puros (findProduct -> calcItem / export)
    expect(findProduct('Z9')).toEqual(novo[0]);
    expect(PRODUCTS).toHaveLength(1);
    expect(await store.get('catalogo')).toEqual(novo);
  });

  it('resetCatalog volta pra tabela embutida e limpa o storage', async () => {
    const r = await mount();
    await act(async () => {
      await r.current.updateCatalog([
        { codigo: 'X', nome: 'x', preco_st: 1, un_cx: 1 },
      ]);
    });
    await act(async () => {
      await r.current.resetCatalog();
    });
    expect(r.current.products).toHaveLength(DEFAULT_PRODUCTS.length);
    expect(await store.get('catalogo', null)).toBe(null);
  });

  it('setProductImage / removeProductImage mexem em customImages e no storage', async () => {
    const r = await mount();
    await act(async () => {
      await r.current.setProductImage('80.822.0003', 'data:image/png;base64,AAA');
    });
    expect(r.current.customImages).toEqual({
      '80.822.0003': 'data:image/png;base64,AAA',
    });
    expect(await store.get('product_images')).toEqual({
      '80.822.0003': 'data:image/png;base64,AAA',
    });

    await act(async () => {
      await r.current.removeProductImage('80.822.0003');
    });
    expect(r.current.customImages).toEqual({});
    expect(await store.get('product_images')).toEqual({});
  });
});
