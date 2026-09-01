import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllImages,
  putImage,
  deleteImage,
  putAllImages,
  clearImages,
  migrateLegacyImages,
} from './imageStore.js';

beforeEach(async () => {
  await clearImages();
  localStorage.removeItem('product_images');
});

describe('imageStore', () => {
  it('put / get / delete de uma imagem', async () => {
    await putImage('A', 'data:img,1');
    await putImage('B', 'data:img,2');
    expect(await getAllImages()).toEqual({ A: 'data:img,1', B: 'data:img,2' });

    await deleteImage('A');
    expect(await getAllImages()).toEqual({ B: 'data:img,2' });
  });

  it('putAllImages grava em lote', async () => {
    await putAllImages({ X: 'data:img,x', Y: 'data:img,y' });
    expect(await getAllImages()).toEqual({ X: 'data:img,x', Y: 'data:img,y' });
  });

  it('migrateLegacyImages move do localStorage e apaga a chave antiga', async () => {
    localStorage.setItem(
      'product_images',
      JSON.stringify({ OLD: 'data:img,legacy' })
    );
    await migrateLegacyImages();
    expect(await getAllImages()).toEqual({ OLD: 'data:img,legacy' });
    expect(localStorage.getItem('product_images')).toBe(null);
  });

  it('migrateLegacyImages não sobrescreve o que já está no IndexedDB', async () => {
    await putImage('OLD', 'data:img,novo');
    localStorage.setItem(
      'product_images',
      JSON.stringify({ OLD: 'data:img,legacy' })
    );
    await migrateLegacyImages();
    expect((await getAllImages()).OLD).toBe('data:img,novo');
    expect(localStorage.getItem('product_images')).toBe(null);
  });

  it('migrateLegacyImages sem nada no localStorage é no-op', async () => {
    await migrateLegacyImages();
    expect(await getAllImages()).toEqual({});
  });
});
