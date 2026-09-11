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

describe('avisos de cadastro repetido', () => {
  const marcarTodas = () =>
    screen.getAllByRole('checkbox').forEach((c) => fireEvent.click(c));

  it('barra nome abreviado repetido entre as unidades', async () => {
    // foi o que aconteceu de verdade: matriz e filiais com o mesmo abreviado
    await salvarFicha({
      ...cliente('Mercado Triunfo Matriz', 'Prudente'),
      nomeAbrev: 'M TRIUNFO',
      cnpj: '65.715.049/0001-76',
    });
    await salvarFicha({
      ...cliente('Mercado Triunfo Filial 01', 'Prudente'),
      nomeAbrev: 'M TRIUNFO',
      cnpj: '65.715.049/0003-38',
    });
    abrir();
    await screen.findByText('Mercado Triunfo Matriz');
    marcarTodas();
    fireEvent.click(screen.getByText(/Gerar com 2 clientes/));

    expect(
      await screen.findByText(/nome abreviado "M TRIUNFO" em 2 clientes/)
    ).toBeTruthy();
  });

  it('barra CNPJ repetido', async () => {
    await salvarFicha({
      ...cliente('Mercado Um', 'Prudente'),
      nomeAbrev: 'MERC UM',
      cnpj: '11.111.111/0001-11',
    });
    await salvarFicha({
      ...cliente('Mercado Dois', 'Prudente'),
      nomeAbrev: 'MERC DOIS',
      cnpj: '11.111.111/0001-11',
    });
    abrir();
    await screen.findByText('Mercado Um');
    marcarTodas();
    fireEvent.click(screen.getByText(/Gerar com 2 clientes/));

    expect(
      await screen.findByText(/CNPJ "11.111.111\/0001-11" em 2 clientes/)
    ).toBeTruthy();
  });

  it('não reclama quando cada unidade tem os seus', async () => {
    await salvarFicha({
      ...cliente('Mercado Um', 'Prudente'),
      nomeAbrev: 'MERC UM',
      cnpj: '11.111.111/0001-11',
    });
    await salvarFicha({
      ...cliente('Mercado Dois', 'Prudente'),
      nomeAbrev: 'MERC DOIS',
      cnpj: '22.222.222/0001-22',
    });
    abrir();
    await screen.findByText('Mercado Um');
    marcarTodas();
    fireEvent.click(screen.getByText(/Gerar com 2 clientes/));

    // o aviso que aparece é o de "menos de 3", não o de repetido
    expect(await screen.findByText(/3 ou mais clientes/)).toBeTruthy();
    expect(screen.queryByText(/recusa cadastro repetido/)).toBeNull();
  });
});
