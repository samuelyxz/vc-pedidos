import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import App from './App.jsx';
import { CatalogProvider } from './state/CatalogContext.jsx';

afterEach(cleanup);

const renderApp = () =>
  render(
    <CatalogProvider>
      <App />
    </CatalogProvider>
  );

// Smoke test: exercita todo o grafo de módulos (App -> views -> components -> lib)
// dentro de um DOM real. Falha se qualquer import/render quebrar.
describe('<App />', () => {
  it('monta e renderiza a navegação principal', async () => {
    renderApp();
    // some o "Carregando..." e a navegação aparece (labels aparecem em mais
    // de um lugar — sidebar desktop + barra mobile — daí o findAllByText).
    expect((await screen.findAllByText('Novo Pedido')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bonificações').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Clientes').length).toBeGreaterThan(0);
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument();
  });

  it('começa na aba de pedido e mostra o catálogo de produtos', async () => {
    renderApp();
    // produto da tabela embutida
    expect(await screen.findByText(/CREME DE LEITE LACFREE 500G/i)).toBeInTheDocument();
  });

  it('a aba Ajustes tem o card de backup (exportar/importar)', async () => {
    renderApp();
    const ajustes = (await screen.findAllByText('Ajustes'))[0];
    fireEvent.click(ajustes);
    expect(await screen.findByText('Backup dos dados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exportar backup/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Importar backup/i })).toBeInTheDocument();
  });
});
