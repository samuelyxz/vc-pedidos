import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { FichasSalvasModal } from './FichasSalvasModal.jsx';
import { ToastProvider } from '../state/ToastContext.jsx';
import { salvarFicha, listarFichas } from '../lib/fichasSalvas.js';
import { store } from '../lib/storage.js';

afterEach(cleanup);
beforeEach(async () => {
  await store.delete('fichas');
});

const matriz = {
  razaoSocial: 'Supermercado São João Ltda',
  nomeAbrev: 'MERC S JOAO',
  cnpj: '11.111.111/0001-11',
  ie: '123456',
  municipio: 'Presidente Prudente',
  estado: 'SP',
  logradouro: 'Avenida Brasil',
  banco: 'SICREDI',
  agencia: '0710',
  resp_vendas: 'ALA REP',
  filial: '',
};

const abrir = (onAbrir = () => {}) =>
  render(
    <ToastProvider>
      <FichasSalvasModal onAbrir={onAbrir} onClose={() => {}} />
    </ToastProvider>
  );

describe('<FichasSalvasModal />', () => {
  it('avisa quando ainda não há ficha nenhuma', async () => {
    abrir();
    expect(await screen.findByText('Nenhuma ficha gerada ainda.')).toBeTruthy();
  });

  it('lista a ficha com cliente, cidade e CNPJ', async () => {
    await salvarFicha(matriz);
    abrir();
    expect(
      await screen.findByText('Supermercado São João Ltda')
    ).toBeTruthy();
    expect(screen.getByText('Presidente Prudente - SP')).toBeTruthy();
    expect(screen.getByText('CNPJ: 11.111.111/0001-11')).toBeTruthy();
  });

  it('marca as filiais', async () => {
    await salvarFicha({ ...matriz, filial: 'S', razaoSocial: 'Filial Um' });
    abrir();
    const item = (await screen.findByText('Filial Um')).closest('li');
    expect(within(item).getByText('FILIAL')).toBeTruthy();
  });

  it('abrir para conferir devolve a ficha com o id, para atualizar a mesma', async () => {
    const salva = await salvarFicha(matriz);
    const onAbrir = vi.fn();
    abrir(onAbrir);
    fireEvent.click(await screen.findByText('Abrir e conferir'));
    expect(onAbrir).toHaveBeenCalledWith({ form: salva.form, id: salva.id });
  });

  it('duplicar para filial vem sem id e sem os dados da unidade', async () => {
    await salvarFicha(matriz);
    const onAbrir = vi.fn();
    abrir(onAbrir);
    fireEvent.click(await screen.findByText('Duplicar para filial'));

    const [arg] = onAbrir.mock.calls[0];
    expect(arg.id).toBeUndefined(); // vira ficha nova, não sobrescreve a matriz
    expect(arg.form.razaoSocial).toBe('Supermercado São João Ltda');
    expect(arg.form.banco).toBe('SICREDI');
    expect(arg.form.cnpj).toBe('');
    expect(arg.form.municipio).toBe('');
    expect(arg.form.nomeAbrev).toBe('');
    expect(arg.form.filial).toBe('S');
  });

  it('excluir pede confirmação e tira da lista', async () => {
    await salvarFicha(matriz);
    abrir();
    fireEvent.click(
      await screen.findByLabelText(
        'Excluir ficha de Supermercado São João Ltda'
      )
    );
    fireEvent.click(await screen.findByText('Excluir'));

    await waitFor(async () => expect(await listarFichas()).toHaveLength(0));
    expect(
      await screen.findByText('Nenhuma ficha gerada ainda.')
    ).toBeTruthy();
  });
});
