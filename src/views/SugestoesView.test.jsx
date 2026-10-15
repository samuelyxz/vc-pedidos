import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import App from '../App.jsx';
import { CatalogProvider } from '../state/CatalogContext.jsx';
import { ToastProvider } from '../state/ToastContext.jsx';
import { store } from '../lib/storage.js';
import { salvarSugestao, novaSugestao } from '../lib/sugestoes.js';

afterEach(cleanup);
beforeEach(async () => {
  for (const k of ['sugestoes', 'pedidoAtual', 'catalogo', 'catalogo_meta']) {
    await store.delete(k);
  }
});

const PRODUTO = 'CREME DE LEITE LACFREE 500G';

async function abrirSugestoes() {
  render(
    <ToastProvider>
      <CatalogProvider>
        <App />
      </CatalogProvider>
    </ToastProvider>
  );
  // o menu aparece duas vezes (lateral e barra do celular)
  fireEvent.click((await screen.findAllByText('Sugestões'))[0]);
}

describe('Sugestões de compra', () => {
  it('monta sem cliente, salva sozinha e vira pedido', async () => {
    await abrirSugestoes();
    expect(
      await screen.findByText('Nenhuma sugestão salva ainda')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Nova' }));
    fireEvent.change(screen.getByLabelText('Nome da sugestão'), {
      target: { value: 'Mix mercado pequeno' },
    });
    // não existe campo de cliente na sugestão
    expect(screen.queryByText('Selecionar cliente...')).toBeNull();

    fireEvent.click(screen.getByText(PRODUTO));
    // tudo já é sugestão: a opção de destacar não aparece
    expect(screen.queryByText(/Marcar como sugestão/)).toBeNull();
    fireEvent.click(screen.getByText('Adicionar'));

    await waitFor(async () => {
      const [salva] = await store.get('sugestoes', []);
      expect(salva?.nome).toBe('Mix mercado pequeno');
      expect(salva?.items).toHaveLength(1);
    });

    // volta para a lista e a sugestão está lá
    fireEvent.click(screen.getByText('Sugestões salvas'));
    expect(await screen.findByText('Mix mercado pequeno')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Usar Mix mercado pequeno no pedido'));
    expect(await screen.findByText('Selecionar cliente...')).toBeInTheDocument();
    await waitFor(async () =>
      expect((await store.get('pedidoAtual')).items).toHaveLength(1)
    );
    // percorre o App inteiro com o catálogo completo; com a suíte rodando em
    // paralelo passa dos 5 s padrão
  }, 20000);

  it('pergunta antes de trocar um pedido que já tem produtos', async () => {
    await store.set('pedidoAtual', {
      id: 'p1',
      numero: '',
      data: '2026-10-15',
      clienteId: null,
      items: [{ codigo: '80.822.0002', caixas: 3, bonif: 0, descPct: 0 }],
      obs: '',
    });
    await salvarSugestao({
      ...novaSugestao(),
      nome: 'Mix',
      items: [{ codigo: '80.822.0003', caixas: 1, bonif: 0, descPct: 0 }],
    });
    await abrirSugestoes();

    fireEvent.click(await screen.findByLabelText('Usar Mix no pedido'));
    const dialogo = await screen.findByText(/já tem 1 produto/);
    // cancelar mantém o pedido como estava
    fireEvent.click(
      within(dialogo.closest('[role="dialog"]') ?? document.body).getByText(
        'Cancelar'
      )
    );
    await waitFor(() => expect(screen.queryByText(/já tem 1 produto/)).toBeNull());
    expect((await store.get('pedidoAtual')).items[0].codigo).toBe('80.822.0002');
  });

  it('excluir pede confirmação e tira da lista', async () => {
    await salvarSugestao({ ...novaSugestao(), nome: 'Descartável' });
    await abrirSugestoes();

    fireEvent.click(await screen.findByLabelText('Excluir Descartável'));
    fireEvent.click(await screen.findByText('Excluir'));
    expect(
      await screen.findByText('Nenhuma sugestão salva ainda')
    ).toBeInTheDocument();
  });
});
