import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { FichaCadastralModal } from './FichaCadastralModal.jsx';
import { ToastProvider } from '../state/ToastContext.jsx';
import { BANCOS, REPRESENTANTES, TABELAS_PRECO } from '../data/fichaBase.js';
import { listarFichas } from '../lib/fichasSalvas.js';
import { store } from '../lib/storage.js';

afterEach(cleanup);

const abrir = (cliente) =>
  render(
    <ToastProvider>
      <FichaCadastralModal clienteInicial={cliente} onClose={() => {}} />
    </ToastProvider>
  );

describe('<FichaCadastralModal />', () => {
  it('traz os dados do cliente já preenchidos', () => {
    abrir({
      razaoSocial: 'Supermercado Teste Ltda',
      nomeFantasia: 'Super Teste',
      cidade: 'Presidente Prudente',
      uf: 'SP',
    });
    expect(screen.getByLabelText('Razão Social').value).toBe(
      'Supermercado Teste Ltda'
    );
    expect(screen.getByLabelText('Nome Fantasia').value).toBe('Super Teste');
    // o nome abreviado nasce do fantasia, cortado em 12 caracteres
    expect(screen.getByLabelText(/Nome Abrev/).value).toBe('Super Teste');
  });

  it('monta os selects com as listas oficiais da Verde Campo', () => {
    abrir({});
    const banco = screen.getByLabelText('Banco');
    // uma opção vazia + a lista inteira
    expect(banco.querySelectorAll('option')).toHaveLength(BANCOS.length + 1);
    const rep = screen.getByLabelText('Responsável de Vendas');
    expect(rep.querySelectorAll('option')).toHaveLength(
      REPRESENTANTES.length + 1
    );
  });

  it('mostra o código do banco assim que ele é escolhido', () => {
    abrir({});
    const banco = screen.getByLabelText('Banco');
    fireEvent.change(banco, { target: { value: 'BANCO BRADESCO' } });
    expect(screen.getByLabelText('Banco (cód. 237)')).toBeTruthy();
  });

  it('avisa quando a tabela de preço não está na lista', () => {
    abrir({});
    const tabela = screen.getByLabelText('Tabela de Preço');
    fireEvent.change(tabela, { target: { value: 'INVENTADA' } });
    expect(screen.getByText('Precisa ser um item da lista.')).toBeTruthy();

    fireEvent.change(tabela, { target: { value: TABELAS_PRECO[0] } });
    expect(screen.queryByText('Precisa ser um item da lista.')).toBeNull();
  });

  it('limita o nome abreviado a 12 caracteres', () => {
    abrir({});
    const campo = screen.getByLabelText(/Nome Abrev/);
    fireEvent.change(campo, { target: { value: 'NOME MUITO COMPRIDO' } });
    expect(campo.value).toBe('NOME MUITO C');
  });
});

describe('gerar guarda no histórico', () => {
  beforeEach(async () => {
    await store.delete('fichas');
    await store.delete('ficha_rascunho');
  });

  it('a ficha gerada entra no histórico com os dados preenchidos', async () => {
    render(
      <ToastProvider>
        <FichaCadastralModal
          clienteInicial={{ razaoSocial: 'Mercado Do Teste Ltda' }}
          onClose={() => {}}
        />
      </ToastProvider>
    );
    fireEvent.change(screen.getByLabelText('CNPJ'), {
      target: { value: '11.111.111/0001-11' },
    });
    fireEvent.change(screen.getByLabelText('Banco'), {
      target: { value: 'SICREDI' },
    });

    fireEvent.click(screen.getByText('Gerar Ficha'));
    // faltam obrigatórios; seguimos assim mesmo
    fireEvent.click(await screen.findByText('Gerar assim mesmo'));

    await waitFor(async () => expect(await listarFichas()).toHaveLength(1));
    const [f] = await listarFichas();
    expect(f.form.razaoSocial).toBe('Mercado Do Teste Ltda');
    expect(f.form.cnpj).toBe('11.111.111/0001-11');
    expect(f.form.banco).toBe('SICREDI');

    // e o rascunho é limpo, já que a ficha saiu
    expect(await store.get('ficha_rascunho', null)).toBeNull();
  });
});
