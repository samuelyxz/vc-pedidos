import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { FichaCadastralModal } from './FichaCadastralModal.jsx';
import { ToastProvider } from '../state/ToastContext.jsx';
import { lerRascunho, salvarRascunho } from '../lib/fichaRascunho.js';
import { store } from '../lib/storage.js';

afterEach(cleanup);
beforeEach(async () => {
  await store.delete('ficha_rascunho');
});

const abrir = (props = {}) =>
  render(
    <ToastProvider>
      <FichaCadastralModal
        clienteInicial={props.clienteInicial}
        onClose={props.onClose || (() => {})}
      />
    </ToastProvider>
  );

const digitar = (rotulo, valor) =>
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });

describe('rascunho da ficha', () => {
  it('não guarda nada enquanto o formulário está intocado', async () => {
    abrir({ clienteInicial: { razaoSocial: 'Mercado X' } });
    await waitFor(() => expect(screen.getByLabelText('CNPJ')).toBeTruthy());
    expect(await lerRascunho()).toBeNull();
  });

  it('guarda o preenchimento assim que algo é digitado', async () => {
    abrir({});
    digitar('Razão Social', 'Mercado Novo Ltda');
    await waitFor(async () => {
      const r = await lerRascunho();
      expect(r?.form.razaoSocial).toBe('Mercado Novo Ltda');
    });
  });

  it('ao reabrir, oferece continuar de onde parou', async () => {
    await salvarRascunho({ razaoSocial: 'Mercado Interrompido', cnpj: '123' });
    abrir({});
    expect(await screen.findByText('Mercado Interrompido')).toBeTruthy();

    fireEvent.click(screen.getByText('Continuar de onde parei'));
    expect(screen.getByLabelText('Razão Social').value).toBe(
      'Mercado Interrompido'
    );
    expect(screen.getByLabelText('CNPJ').value).toBe('123');
  });

  it('descartar apaga o rascunho e some com o aviso', async () => {
    await salvarRascunho({ razaoSocial: 'Para Descartar' });
    abrir({});
    fireEvent.click(await screen.findByText('Descartar'));
    await waitFor(async () => expect(await lerRascunho()).toBeNull());
    expect(screen.queryByText('Para Descartar')).toBeNull();
  });

  it('não oferece rascunho sem nome nenhum preenchido', async () => {
    await salvarRascunho({ razaoSocial: '', nomeFantasia: '', cnpj: '99' });
    abrir({});
    await waitFor(() => expect(screen.getByLabelText('CNPJ')).toBeTruthy());
    expect(screen.queryByText('Continuar de onde parei')).toBeNull();
  });
});

describe('fechar a ficha', () => {
  it('sai direto quando nada foi mexido', async () => {
    const onClose = vi.fn();
    abrir({ onClose });
    fireEvent.click(screen.getByLabelText('Fechar'));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('pergunta antes de fechar com o formulário preenchido', async () => {
    const onClose = vi.fn();
    abrir({ onClose });
    digitar('Razão Social', 'Mercado Meio Preenchido');

    fireEvent.click(screen.getByLabelText('Fechar'));
    expect(await screen.findByText(/Fechar a ficha\?/)).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Continuar preenchendo'));
    await waitFor(() =>
      expect(screen.queryByText(/Fechar a ficha\?/)).toBeNull()
    );
    expect(onClose).not.toHaveBeenCalled();
    // e o que estava digitado continua lá
    expect(screen.getByLabelText('Razão Social').value).toBe(
      'Mercado Meio Preenchido'
    );
  });

  it('fecha de fato quando o usuário confirma, mantendo o rascunho', async () => {
    const onClose = vi.fn();
    abrir({ onClose });
    digitar('Razão Social', 'Mercado Abandonado');

    fireEvent.click(screen.getByLabelText('Fechar'));
    fireEvent.click(await screen.findByText('Fechar sem terminar'));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));

    const r = await lerRascunho();
    expect(r?.form.razaoSocial).toBe('Mercado Abandonado');
  });
});
