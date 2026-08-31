// Helpers puros de formatação / identificadores.
export const uid = () => Math.random().toString(36).slice(2, 11);
export const formatBRL = (n) =>
  (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pt-BR');
};
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const formatBRLPlain = (n) =>
  'R$ ' +
  (n || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export const formatKgPlain = (n) =>
  (n || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' kg';
export const escapeHtml = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
