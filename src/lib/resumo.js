/** @typedef {import('../types.js').Pedido} Pedido */

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * "2026-09" -> "Setembro 2026".
 *
 * Fatiamos a string em vez de usar Date: `new Date('2026-09-01')` nasce à
 * meia-noite UTC e, no fuso do Brasil, voltaria para 31 de agosto — o mês
 * inteiro apareceria com o nome errado.
 *
 * @param {string} chave
 */
export function rotuloMes(chave) {
  const [ano, mes] = chave.split('-');
  const nome = MESES[Number(mes) - 1];
  return nome ? `${nome} ${ano}` : chave;
}

/**
 * @typedef {Object} ResumoMes
 * @property {string} chave        'yyyy-mm', serve para ordenar
 * @property {string} rotulo       'Setembro 2026'
 * @property {Pedido[]} pedidos
 * @property {number} total        soma em R$
 * @property {number} qtd
 * @property {number} media        ticket médio
 * @property {number|null} variacao  fração vs o mês anterior com pedidos
 */

/**
 * Agrupa os pedidos por mês, do mais recente para o mais antigo.
 *
 * A variação compara com o mês anterior que teve pedidos, não com o mês
 * calendário anterior: um mês sem venda no meio faria a conta dividir por
 * zero e o número não diria nada.
 *
 * @param {Pedido[]} pedidos
 * @returns {ResumoMes[]}
 */
export function resumirPorMes(pedidos) {
  /** @type {Map<string, Pedido[]>} */
  const porMes = new Map();
  for (const p of pedidos || []) {
    const chave = String(p?.data || '').slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(chave)) continue;
    if (!porMes.has(chave)) porMes.set(chave, []);
    porMes.get(chave).push(p);
  }

  // crescente para calcular a variação, invertido no fim para exibir
  const crescente = [...porMes.keys()].sort();
  const meses = crescente.map((chave, i) => {
    const doMes = porMes.get(chave);
    const total = doMes.reduce((s, p) => s + (Number(p.total) || 0), 0);
    const anterior = i > 0 ? porMes.get(crescente[i - 1]) : null;
    const totalAnterior = anterior
      ? anterior.reduce((s, p) => s + (Number(p.total) || 0), 0)
      : 0;
    return {
      chave,
      rotulo: rotuloMes(chave),
      pedidos: [...doMes].sort((a, b) =>
        String(b.data).localeCompare(String(a.data))
      ),
      total,
      qtd: doMes.length,
      media: doMes.length ? total / doMes.length : 0,
      variacao: totalAnterior > 0 ? total / totalAnterior - 1 : null,
    };
  });

  return meses.reverse();
}

/**
 * Números do período inteiro.
 * @param {Pedido[]} pedidos
 */
export function resumirTudo(pedidos) {
  const lista = pedidos || [];
  const total = lista.reduce((s, p) => s + (Number(p.total) || 0), 0);
  return {
    total,
    qtd: lista.length,
    media: lista.length ? total / lista.length : 0,
  };
}
