import { useId } from 'react';

const LABEL = 'text-xs font-medium text-stone-600 mb-1 block';
const CONTROL =
  'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2';

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${CONTROL} border-stone-300`}
      />
    </div>
  );
}

// Campo de escolha fechada. A ficha cadastral valida essas opções por VLOOKUP,
// então digitar livre quebraria o arquivo — daí ser um <select> de verdade.
export function Select({
  label,
  value,
  onChange,
  options,
  vazio = 'Selecionar',
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${CONTROL} border-stone-300 bg-white`}
      >
        <option value="">{vazio}</option>
        {options.map((o) => {
          const val = typeof o === 'string' ? o : o.value;
          const txt = typeof o === 'string' ? o : o.label;
          return (
            <option key={val} value={val}>
              {txt}
            </option>
          );
        })}
      </select>
    </div>
  );
}

// Mesma ideia do Select, mas para listas grandes demais para rolar (a de
// tabelas de preço passa de 600): o usuário digita e o navegador filtra.
export function Combo({ label, value, onChange, options, invalido = false }) {
  const id = useId();
  const listaId = `${id}-lista`;
  const erroId = `${id}-erro`;
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <input
        id={id}
        list={listaId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite para buscar"
        aria-invalid={invalido}
        aria-describedby={invalido ? erroId : undefined}
        className={`${CONTROL} ${
          invalido ? 'border-red-400 bg-red-50' : 'border-stone-300'
        }`}
      />
      <datalist id={listaId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
      {invalido && (
        <p id={erroId} className="text-[11px] text-red-600 mt-1">
          Precisa ser um item da lista.
        </p>
      )}
    </div>
  );
}
