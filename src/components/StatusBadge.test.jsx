import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { StatusBadge } from './StatusBadge.jsx';

afterEach(cleanup);

describe('StatusBadge', () => {
  it.each([
    ['LANÇAMENTO', 'LANÇ.'],
    ['NOVO', 'NOVO'],
    ['DESCONTINUADO', 'DESCONT.'],
  ])('%s vira %s', (status, texto) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(texto)).toBeInTheDocument();
  });

  it('produto novo nunca aparece como descontinuado', () => {
    render(<StatusBadge status="NOVO" />);
    expect(screen.queryByText('DESCONT.')).toBeNull();
  });

  it('sem status, ou status desconhecido, não mostra selo', () => {
    const { container, rerender } = render(<StatusBadge status="" />);
    expect(container).toBeEmptyDOMElement();
    rerender(<StatusBadge status="QUALQUER" />);
    expect(container).toBeEmptyDOMElement();
  });
});
