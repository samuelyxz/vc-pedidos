import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { FichaMassaModal } from './FichaMassaModal.jsx';
import { ToastProvider } from '../state/ToastContext.jsx';
import { salvarFicha } from '../lib/fichasSalvas.js';
import { store } from '../lib/storage.js';

afterEach(cleanup);
beforeEach(async () => {
  await store.delete('fichas');
});

const cliente = (nome, cidade) => ({
  razaoSocial: nome,
  nomeAbrev: nome.slice(0, 12),
  cnpj: '11.111.111/0001-11',
  municipio: cidade,
  estado: 'SP',
  banco: 'SICREDI',
  resp_vendas: 'ALA REP',
});

const abrir = () =>
  render(
    <ToastProvider>
      <FichaMassaModal onClose={() => {}} />
    </ToastProvider>
  );

describe('<FichaMassaModal />', () => {
  it('avisa quando não há ficha para aproveitar', async () => {
    abrir();
    expect(await screen.findByText('Nenhuma ficha gerada ainda.')).toBeTruthy();
  });

  it('lista as fichas salvas para escolher', async () => {
    await salvarFicha(cliente('Mercado Matriz', 'Presidente Prudente'));
    await salvarFicha(cliente('Mercado Filial', 'Alvares Machado'));
    abrir();
    expect(await screen.findByText('Mercado Matriz')).toBeTruthy();
    expect(screen.getByText('Mercado Filial')).toBeTruthy();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('numera na ordem em que você marca', async () => {
    await salvarFicha(cliente('Primeira Salva', 'Cidade A'));
    await salvarFicha(cliente('Segunda Salva', 'Cidade B'));
    abrir();
    await screen.findByText('Primeira Salva');

    // marca a de baixo antes da de cima: ela tem que virar a 1ª
    const caixas = screen.getAllByRole('checkbox');
    fireEvent.click(caixas[1]);
    fireEvent.click(caixas[0]);
    expect(screen.getByText('1º').closest('label').textContent).toContain(
      'Primeira Salva'
    );
    expect(screen.getByText('2º').closest('label').textContent).toContain(
      'Segunda Salva'
    );
  });

  it('o botão diz quantos vão e começa desabilitado', async () => {
    await salvarFicha(cliente('Mercado Matriz', 'Cidade'));
    abrir();
    await screen.findByText('Mercado Matriz');

    const botao = screen.getByText(/Gerar com 0 clientes/).closest('button');
    expect(botao.disabled).toBe(true);

    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(screen.getByText(/Gerar com 1 cliente$/)).toBeTruthy();
  });

  it('explica o conserto da aba de importação', async () => {
    abrir();
    expect(
      await screen.findByText(/só monta a aba de importação do primeiro/i)
    ).toBeTruthy();
  });
});
