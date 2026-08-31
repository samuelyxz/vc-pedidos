

export function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-600 mb-1 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
      />
    </div>
  );
}
