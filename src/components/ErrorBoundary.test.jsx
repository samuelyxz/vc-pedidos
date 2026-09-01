import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary.jsx';

afterEach(cleanup);

function Boom() {
  throw new Error('estourou de propósito');
}

describe('<ErrorBoundary />', () => {
  it('deixa passar quando não há erro', () => {
    render(
      <ErrorBoundary>
        <p>conteúdo ok</p>
      </ErrorBoundary>
    );
    expect(screen.getByText('conteúdo ok')).toBeInTheDocument();
  });

  it('mostra o fallback quando um filho estoura', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Recarregar/i })
    ).toBeInTheDocument();
    spy.mockRestore();
  });

  it('usa o fallback customizado quando passado', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={({ error }) => <p>custom: {error.message}</p>}>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('custom: estourou de propósito')).toBeInTheDocument();
    spy.mockRestore();
  });
});
