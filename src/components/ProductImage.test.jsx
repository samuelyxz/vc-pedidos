import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { CatalogProvider } from '../state/CatalogContext.jsx';
import { putImage, clearImages, clearCachedCatalogImages } from '../lib/imageStore.js';
import { ProductImage } from './ProductImage.jsx';

afterEach(cleanup);
beforeEach(async () => {
  await clearImages();
  await clearCachedCatalogImages();
});

const withProvider = (ui) => render(<CatalogProvider>{ui}</CatalogProvider>);

const PROD = {
  codigo: 'X1',
  nome: 'Produto X',
  categoria: 'IOGURTE',
  imagem: 'https://exemplo.com/foto.png',
};

describe('<ProductImage />', () => {
  it('sem imagem mostra o ícone da categoria', async () => {
    withProvider(<ProductImage product={{ codigo: 'Y', nome: 'Y', categoria: 'QUEIJO' }} />);
    expect(await screen.findByText('🧀')).toBeInTheDocument();
  });

  it('começa pelo proxy e cai pra URL direta, depois cache-buster, depois ícone', async () => {
    withProvider(<ProductImage product={PROD} />);
    const img = () => screen.queryByRole('img');
    await waitFor(() => expect(img()).toBeInTheDocument());
    expect(img().getAttribute('src')).toContain('wsrv.nl');

    fireEvent.error(img());
    await waitFor(() =>
      expect(img().getAttribute('src')).toBe('https://exemplo.com/foto.png')
    );

    fireEvent.error(img());
    await waitFor(() => expect(img().getAttribute('src')).toContain('_r=1'));

    fireEvent.error(img());
    await waitFor(() => expect(img()).not.toBeInTheDocument());
    expect(screen.getByText('🥛')).toBeInTheDocument();
  });

  it('usa a foto customizada e, se ela falhar, cai pra rede', async () => {
    await putImage('X1', 'data:image/png;base64,QQ==');
    withProvider(<ProductImage product={PROD} />);
    const img = () => screen.getByRole('img');
    await waitFor(() =>
      expect(img().getAttribute('src')).toBe('data:image/png;base64,QQ==')
    );
    fireEvent.error(img());
    await waitFor(() => expect(img().getAttribute('src')).toContain('wsrv.nl'));
  });
});
