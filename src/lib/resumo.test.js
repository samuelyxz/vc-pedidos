import { describe, it, expect } from 'vitest';
import { resumirPorMes, resumirTudo, rotuloMes } from './resumo.js';

const pedido = (data, total, id = data + total) => ({
  id,
  numero: id,
  data,
  total,
  items: [],
  obs: '',
  clienteId: null,
});

describe('rotuloMes', () => {
  it('traduz a chave em mês por extenso', () => {
    expect(rotuloMes('2026-09')).toBe('Setembro 2026');
    expect(rotuloMes('2026-01')).toBe('Janeiro 2026');
    expect(rotuloMes('2025-12')).toBe('Dezembro 2025');
  });

  it('não escorrega de mês por causa de fuso', () => {
    // com Date, '2026-03-01' vira 28/02 no horário de Brasília
    expect(rotuloMes('2026-03')).toBe('Março 2026');
  });

  it('devolve a chave crua se ela não fizer sentido', () => {
    expect(rotuloMes('xx')).toBe('xx');
  });
});

describe('resumirPorMes', () => {
  it('agrupa e soma cada mês, do mais recente pro mais antigo', () => {
    const r = resumirPorMes([
      pedido('2026-08-10', 100),
      pedido('2026-09-01', 300),
      pedido('2026-08-25', 200),
    ]);
    expect(r.map((m) => m.chave)).toEqual(['2026-09', '2026-08']);
    expect(r[0].total).toBe(300);
    expect(r[1].total).toBe(300);
    expect(r[1].qtd).toBe(2);
    expect(r[1].media).toBe(150);
  });

  it('ordena os pedidos de cada mês do mais novo pro mais velho', () => {
    const r = resumirPorMes([
      pedido('2026-08-01', 10, 'a'),
      pedido('2026-08-20', 20, 'b'),
    ]);
    expect(r[0].pedidos.map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('calcula a variação contra o mês anterior', () => {
    const r = resumirPorMes([
      pedido('2026-08-10', 1000),
      pedido('2026-09-10', 1500),
    ]);
    expect(r[0].variacao).toBeCloseTo(0.5); // setembro subiu 50%
    expect(r[1].variacao).toBeNull(); // agosto não tem com o que comparar
  });

  it('mostra queda como variação negativa', () => {
    const r = resumirPorMes([
      pedido('2026-08-10', 1000),
      pedido('2026-09-10', 750),
    ]);
    expect(r[0].variacao).toBeCloseTo(-0.25);
  });

  it('compara com o último mês que teve venda, pulando os vazios', () => {
    const r = resumirPorMes([
      pedido('2026-06-10', 1000),
      pedido('2026-09-10', 2000),
    ]);
    // julho e agosto sem pedido: setembro compara com junho, não com zero
    expect(r[0].variacao).toBeCloseTo(1);
  });

  it('ignora pedido sem data utilizável', () => {
    const r = resumirPorMes([
      pedido('2026-09-10', 100),
      { id: 'x', data: '', total: 999, items: [] },
      { id: 'y', total: 999, items: [] },
    ]);
    expect(r).toHaveLength(1);
    expect(r[0].total).toBe(100);
  });

  it('trata total ausente como zero em vez de quebrar', () => {
    const r = resumirPorMes([
      { id: 'a', data: '2026-09-01', items: [] },
      pedido('2026-09-02', 50),
    ]);
    expect(r[0].total).toBe(50);
    expect(r[0].qtd).toBe(2);
  });

  it('aguenta lista vazia e nula', () => {
    expect(resumirPorMes([])).toEqual([]);
    expect(resumirPorMes(null)).toEqual([]);
  });
});

describe('resumirTudo', () => {
  it('soma tudo e tira o ticket médio', () => {
    const r = resumirTudo([pedido('2026-08-10', 100), pedido('2026-09-10', 300)]);
    expect(r.total).toBe(400);
    expect(r.qtd).toBe(2);
    expect(r.media).toBe(200);
  });

  it('não divide por zero sem pedido nenhum', () => {
    expect(resumirTudo([])).toEqual({ total: 0, qtd: 0, media: 0 });
  });
});
