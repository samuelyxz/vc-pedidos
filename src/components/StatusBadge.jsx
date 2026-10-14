// Selo do status do produto. Fica num lugar só porque as telas tinham cada uma
// a sua cópia, e a do Novo Pedido tratava qualquer status que não fosse
// lançamento — inclusive "NOVO" — como descontinuado.

/** @type {{ teste: RegExp, texto: string, classe: string }[]} */
const SELOS = [
  { teste: /lan/i, texto: 'LANÇ.', classe: 'bg-blue-100 text-blue-700' },
  { teste: /nov/i, texto: 'NOVO', classe: 'bg-blue-100 text-blue-700' },
  { teste: /desc/i, texto: 'DESCONT.', classe: 'bg-stone-200 text-stone-600' },
];

/** @param {{ status?: string }} props */
export function StatusBadge({ status }) {
  const selo = status && SELOS.find((s) => s.teste.test(status));
  if (!selo) return null;
  return (
    <span
      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${selo.classe}`}
    >
      {selo.texto}
    </span>
  );
}
