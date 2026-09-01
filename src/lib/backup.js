import { store } from './storage.js';
import { todayISO } from './format.js';
import { getAllImages, putAllImages } from './imageStore.js';

// Chaves guardadas no localStorage.
export const LOCAL_KEYS = [
  'clientes',
  'vendedor',
  'supervisor',
  'pedidoAtual',
  'pedidos',
  'bonificacoes',
  'catalogo',
  'catalogo_meta',
];

// Tudo que um backup reconhece. `product_images` vive no IndexedDB, não no
// localStorage, mas continua indo no mesmo .json para o backup ser completo.
export const BACKUP_KEYS = [...LOCAL_KEYS, 'product_images'];

// Monta o objeto de backup (formato "empacotado", valores já desserializados).
export async function collectBackup() {
  const data = {};
  for (const key of LOCAL_KEYS) {
    const v = await store.get(key, null);
    if (v !== null && v !== undefined) data[key] = v;
  }
  const imgs = await getAllImages();
  if (Object.keys(imgs).length) data.product_images = imgs;
  return {
    _app: 'vc-pedidos',
    _format: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

// Dispara o download de um .json com todos os dados.
export async function downloadBackup() {
  const payload = await collectBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vc-pedidos-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return Object.keys(payload.data);
}

// Aceita o formato empacotado { _app, data: {...} } OU um dump cru do
// localStorage ({ chave: "<string json>" }). Retorna { chave: valor } só com
// as chaves reconhecidas, com os valores já desserializados.
export function normalizeBackup(parsed) {
  const src =
    parsed && typeof parsed === 'object' && parsed.data && typeof parsed.data === 'object'
      ? parsed.data
      : parsed;
  if (!src || typeof src !== 'object' || Array.isArray(src)) {
    throw new Error('Arquivo de backup inválido.');
  }
  const out = {};
  for (const key of BACKUP_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(src, key)) continue;
    let v = src[key];
    if (typeof v === 'string') {
      try {
        v = JSON.parse(v);
      } catch {
        // valor era mesmo uma string simples (ex.: supervisor)
      }
    }
    out[key] = v;
  }
  if (Object.keys(out).length === 0) {
    throw new Error(
      'Nenhum dado reconhecido no arquivo (esperado: clientes, pedidos, bonificações, etc.).',
    );
  }
  return out;
}

// Grava o backup no armazenamento. NÃO recarrega a página — quem chama decide.
export async function applyBackup(parsed) {
  const data = normalizeBackup(parsed);
  for (const [key, value] of Object.entries(data)) {
    if (key === 'product_images') {
      await putAllImages(value);
    } else {
      await store.set(key, value);
    }
  }
  return Object.keys(data);
}
