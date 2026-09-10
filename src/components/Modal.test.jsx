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
    const dentro = screen.getByText('dentro');
    fireEvent.mouseDown(dentro);
    fireEvent.click(dentro);
    expect(onClose).not.toHaveBeenCalled();

    // backdrop é o pai do dialog
    const fundo = screen.getByRole('dialog').parentElement;
    fireEvent.mouseDown(fundo);
    fireEvent.click(fundo);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('não fecha quando o clique começa dentro e termina no backdrop', () => {
    // é o que acontece ao arrastar para selecionar o texto de um campo:
    // o navegador entrega o click no backdrop, e o modal fechava sozinho
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <input defaultValue="texto do campo" />
      </Modal>
    );
    fireEvent.mouseDown(screen.getByDisplayValue('texto do campo'));
    fireEvent.click(screen.getByRole('dialog').parentElement);
    expect(onClose).not.toHaveBeenCalled();
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
