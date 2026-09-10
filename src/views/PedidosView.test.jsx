import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import { PedidosView } from './PedidosView.jsx';
import { ToastProvider } from '../state/ToastContext.jsx';

afterEach(cleanup);

const pedido = (id, data, total, cliente) => ({
  id,
  numero: id,
  data,
  total,
  items: [{ codigo: '80.881.0001', caixas: 1 }],
  obs: '',
  clienteId: id,
  clienteSnapshot: { id, razaoSocial: cliente },
});

const abrir = (pedidos) =>
  render(
    <ToastProvider>
      <PedidosView
        pedidos={pedidos}
        setPedidos={() => {}}
        vendedor={{ nome: 'Samuel', telefone: '', email: '' }}
        onGerarBonificacao={() => {}}
      />
    </ToastProvider>
  );

// O real usa espaço não separável entre "R$" e o número, e os textos vêm
// quebrados em vários nós — comparar a string inteira normalizada é estável.
const texto = (el) => el.textContent.replace(/\s+/g, ' ').trim();

const cartaoResumo = () =>
  screen.getByText('Total em pedidos').parentElement;

const secoes = () => [...document.querySelectorAll('section')];

describe('<PedidosView />', () => {
  it('mostra o total do histórico sem precisar somar na mão', () => {
    abrir([
      pedido('1', '2026-09-01', 1000, 'Mercado A'),
      pedido('2', '2026-09-15', 500, 'Mercado B'),
    ]);
    const resumo = texto(cartaoResumo());
    expect(resumo).toContain('R$ 1.500,00');
    expect(resumo).toContain('2 pedidos · média R$ 750,00');
  });

  it('separa os pedidos por mês, do mais recente pro mais antigo', () => {
    abrir([
      pedido('1', '2026-08-10', 100, 'Mercado A'),
      pedido('2', '2026-09-10', 300, 'Mercado B'),
    ]);
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    ).toEqual(['Setembro 2026', 'Agosto 2026']);
  });

  it('mostra a alta em relação ao mês anterior', () => {
    abrir([
      pedido('1', '2026-08-10', 1000, 'Mercado A'),
      pedido('2', '2026-09-10', 1500, 'Mercado B'),
    ]);
    const [setembro, agosto] = secoes();
    expect(within(setembro).getByText('+50%')).toBeTruthy();
    // agosto é o primeiro mês da série: não tem com o que comparar
    expect(within(agosto).queryByText(/%/)).toBeNull();
  });

  it('marca a queda de um mês pro outro', () => {
    abrir([
      pedido('1', '2026-08-10', 1000, 'Mercado A'),
      pedido('2', '2026-09-10', 400, 'Mercado B'),
    ]);
    expect(within(secoes()[0]).getByText('-60%')).toBeTruthy();
  });

  it('soma cada mês separadamente', () => {
    abrir([
      pedido('1', '2026-08-10', 100, 'Mercado Agosto'),
      pedido('2', '2026-09-10', 300, 'Mercado Setembro'),
      pedido('3', '2026-09-20', 200, 'Outro Setembro'),
    ]);
    const [setembro, agosto] = secoes();
    expect(texto(setembro)).toContain('Setembro 2026');
    expect(texto(setembro)).toContain('2 pedidos · média R$ 250,00');
    expect(texto(agosto)).toContain('1 pedido · média R$ 100,00');
  });

  it('cada pedido continua listado dentro do seu mês', () => {
    abrir([
      pedido('1', '2026-08-10', 100, 'Mercado Agosto'),
      pedido('2', '2026-09-10', 300, 'Mercado Setembro'),
    ]);
    const [setembro, agosto] = secoes();
    expect(within(setembro).getByText('Mercado Setembro')).toBeTruthy();
    expect(within(agosto).getByText('Mercado Agosto')).toBeTruthy();
  });

  it('sem pedido nenhum, não mostra resumo', () => {
    abrir([]);
    expect(screen.getByText('Nenhum pedido finalizado ainda.')).toBeTruthy();
    expect(screen.queryByText('Total em pedidos')).toBeNull();
    expect(secoes()).toHaveLength(0);
  });
});
