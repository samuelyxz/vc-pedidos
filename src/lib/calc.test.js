import { describe, it, expect, beforeEach } from 'vitest';
import { setProducts } from './catalog.js';
import { calcItem, calcOrder, calcBonifItem, calcBonifTotal } from './calc.js';

const CX = { codigo: 'CX1', un_cx: 12, preco_st: 100, unidade: 'CX', peso_kg: 0 };
const KG = { codigo: 'KG1', un_cx: 2, preco_st: 50, unidade: 'KG', peso_kg: 4 };

beforeEach(() => setProducts([CX, KG]));

describe('calcItem — produto por caixa', () => {
  it('multiplica caixas × preço da caixa', () => {
    const r = calcItem({ codigo: 'CX1', caixas: 3 });
    expect(r.vlTotal).toBe(300);
    expect(r.totalUn).toBe(36);
    expect(r.vlUnit).toBeCloseTo(100 / 12);
    expect(r.isKg).toBe(false);
  });

  it('aplica desconto percentual', () => {
    expect(calcItem({ codigo: 'CX1', caixas: 2, descPct: 10 }).vlTotal).toBe(180);
  });

  it('produto inexistente → zeros', () => {
    expect(calcItem({ codigo: 'NOPE', caixas: 5 }).vlTotal).toBe(0);
  });
});

describe('calcItem — produto por quilo', () => {
  it('usa peso_kg × preço/kg', () => {
    const r = calcItem({ codigo: 'KG1', caixas: 3 });
    expect(r.isKg).toBe(true);
    expect(r.totalKg).toBe(12); // 3 caixas × 4 kg
    expect(r.vlTotal).toBe(600); // 12 kg × R$50
    expect(r.vlUnit).toBe(50); // preço já é por kg
  });
});

describe('calcOrder', () => {
  it('soma valor, caixas, bonificação e peso dos itens', () => {
    const r = calcOrder([
      { codigo: 'CX1', caixas: 1, bonif: 2 },
      { codigo: 'KG1', caixas: 1 },
    ]);
    expect(r.total).toBe(300); // 100 + 200
    expect(r.totalCaixas).toBe(2);
    expect(r.totalBonif).toBe(2);
    expect(r.totalKg).toBe(4);
  });
});

describe('calcBonifItem / calcBonifTotal — comportamento atual', () => {
  it('CX: quantidade × preço da caixa', () => {
    expect(calcBonifItem({ codigo: 'CX1', qtd: 3 }).valor).toBe(300);
  });

  // NOTA: hoje o cálculo de KG na bonificação NÃO multiplica por peso_kg
  // (o ternário em calcBonifItem tem os dois ramos iguais). Teste de
  // caracterização — se isso for corrigido, atualizar a expectativa.
  it('KG: quantidade × preço/kg, sem fator de peso (quirk conhecido)', () => {
    expect(calcBonifItem({ codigo: 'KG1', qtd: 3 }).valor).toBe(150);
  });

  it('total soma todos os itens', () => {
    expect(
      calcBonifTotal([
        { codigo: 'CX1', qtd: 1 },
        { codigo: 'CX1', qtd: 2 },
      ]),
    ).toBe(300);
  });
});
