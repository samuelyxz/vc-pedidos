import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Modal } from './Modal.jsx';

afterEach(cleanup);

describe('<Modal />', () => {
  it('renderiza o conteúdo com role=dialog e aria', () => {
    render(
      <Modal onClose={() => {}} ariaLabel="Teste">
        <button>ok</button>
      </Modal>
    );
    const dlg = screen.getByRole('dialog');
    expect(dlg).toHaveAttribute('aria-modal', 'true');
    expect(dlg).toHaveAttribute('aria-label', 'Teste');
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('fecha no ESC', () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <button>x</button>
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('fecha ao clicar no backdrop, não ao clicar no painel', () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <button>dentro</button>
      </Modal>
    );
    fireEvent.click(screen.getByText('dentro'));
    expect(onClose).not.toHaveBeenCalled();
    // backdrop é o pai do dialog
    fireEvent.click(screen.getByRole('dialog').parentElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('move o foco pra dentro ao abrir', () => {
    render(
      <Modal onClose={() => {}}>
        <button>primeiro</button>
        <button>segundo</button>
      </Modal>
    );
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'primeiro' })
    );
  });

  it('só o modal do topo responde ao ESC', () => {
    const closeOuter = vi.fn();
    const closeInner = vi.fn();
    render(
      <>
        <Modal onClose={closeOuter}>
          <button>a</button>
        </Modal>
        <Modal onClose={closeInner}>
          <button>b</button>
        </Modal>
      </>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeInner).toHaveBeenCalledTimes(1);
    expect(closeOuter).not.toHaveBeenCalled();
  });
});
