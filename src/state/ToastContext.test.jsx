import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext.jsx';

afterEach(cleanup);

function Harness() {
  const { notify, confirm } = useToast();
  return (
    <div>
      <button onClick={() => notify('deu ruim', { type: 'error', duration: 0 })}>
        toast
      </button>
      <button
        onClick={async () => {
          const ok = await confirm('tem certeza?');
          notify(ok ? 'confirmou' : 'cancelou', { duration: 0 });
        }}
      >
        confirmar
      </button>
    </div>
  );
}

const setup = () =>
  render(
    <ToastProvider>
      <Harness />
    </ToastProvider>
  );

describe('ToastProvider', () => {
  it('notify mostra um toast', () => {
    setup();
    fireEvent.click(screen.getByText('toast'));
    expect(screen.getByText('deu ruim')).toBeInTheDocument();
  });

  it('clicar no toast fecha ele', () => {
    setup();
    fireEvent.click(screen.getByText('toast'));
    fireEvent.click(screen.getByText('deu ruim'));
    expect(screen.queryByText('deu ruim')).not.toBeInTheDocument();
  });

  it('confirm resolve true no botão de confirmar', async () => {
    setup();
    fireEvent.click(screen.getByText('confirmar'));
    expect(await screen.findByText('tem certeza?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(await screen.findByText('confirmou')).toBeInTheDocument();
  });

  it('confirm resolve false no cancelar', async () => {
    setup();
    fireEvent.click(screen.getByText('confirmar'));
    await screen.findByText('tem certeza?');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(await screen.findByText('cancelou')).toBeInTheDocument();
  });

  it('confirm resolve false no ESC', async () => {
    setup();
    fireEvent.click(screen.getByText('confirmar'));
    await screen.findByText('tem certeza?');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(await screen.findByText('cancelou')).toBeInTheDocument();
  });
});
