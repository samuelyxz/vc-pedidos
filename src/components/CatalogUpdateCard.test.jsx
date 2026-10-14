import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import * as XLSX from 'xlsx';
import { CatalogProvider } from '../state/CatalogContext.jsx';
import { CatalogUpdateCard } from './CatalogUpdateCard.jsx';
import { store } from '../lib/storage.js';
import { DEFAULT_PRODUCTS } from '../data/products.js';

afterEach(cleanup);
beforeEach(async () => {
  for (const k of ['catalogo', 'catalogo_meta']) await store.delete(k);
});

// Tabela como a empresa manda quando há um só lançamento.
function tabelaComUmProduto() {
  const ws = XLSX.utils.json_to_sheet([
    {
      Código: '80.999.0099',
      Descrição: 'IOG LANCAMENTO TESTE 170G VC CX 12',
      'Preço com ST': 50,
    },
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Export');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const file = new File([buf], 'tabela.xlsx');
  // o Blob do jsdom não tem arrayBuffer()
  Object.defineProperty(file, 'arrayBuffer', { value: async () => buf });
  return file;
}

async function importar() {
  const { container } = render(
    <CatalogProvider>
      <CatalogUpdateCard />
    </CatalogProvider>
  );
  await screen.findByText(`${DEFAULT_PRODUCTS.length} produtos`);
  const input = container.querySelector('input[type="file"]');
  fireEvent.change(input, { target: { files: [tabelaComUmProduto()] } });
  await screen.findByText('Confirmar atualização');
}

describe('CatalogUpdateCard', () => {
  it('tabela parcial junta por padrão e não apaga o catálogo', async () => {
    await importar();
    expect(screen.getByLabelText(/Juntar à tabela atual/)).toBeChecked();

    fireEvent.click(screen.getByText('Confirmar atualização'));
    await waitFor(async () =>
      expect(await store.get('catalogo')).toHaveLength(
        DEFAULT_PRODUCTS.length + 1
      )
    );
  });

  it('substituir continua disponível quando escolhido', async () => {
    await importar();
    fireEvent.click(screen.getByLabelText(/Substituir a tabela inteira/));

    fireEvent.click(screen.getByText('Confirmar atualização'));
    await waitFor(async () =>
      expect(await store.get('catalogo')).toHaveLength(1)
    );
  });
});
