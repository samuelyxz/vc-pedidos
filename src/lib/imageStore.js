import {
  get,
  set,
  del,
  entries,
  setMany,
  clear,
  createStore,
} from 'idb-keyval';

// Fotos customizadas de produto ficam no IndexedDB (não no localStorage) para
// não competir por espaço com clientes/pedidos — data URLs em base64 estouram
// rápido o limite de ~5MB do localStorage.
const store = createStore('vc-pedidos', 'product-images');

export async function getAllImages() {
  const out = {};
  for (const [codigo, dataUrl] of await entries(store)) out[codigo] = dataUrl;
  return out;
}

export function putImage(codigo, dataUrl) {
  return set(codigo, dataUrl, store);
}

export function deleteImage(codigo) {
  return del(codigo, store);
}

export function putAllImages(obj) {
  return setMany(Object.entries(obj || {}), store);
}

export function clearImages() {
  return clear(store);
}

// Uma vez: se ainda houver fotos no formato antigo (localStorage), move pro
// IndexedDB e limpa a chave antiga. Sem efeito depois da primeira execução.
// Nunca lança — se falhar, a chave antiga fica e tenta de novo no próximo load.
export async function migrateLegacyImages() {
  if (typeof localStorage === 'undefined') return;
  let raw;
  try {
    raw = localStorage.getItem('product_images');
  } catch {
    return;
  }
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const keys = Object.keys(parsed);
      if (keys.length) {
        const existing = await get(keys[0], store);
        if (existing === undefined) await putAllImages(parsed);
      }
    }
    localStorage.removeItem('product_images');
  } catch {
    // IDB indisponível / valor corrompido — mantém a chave antiga e tenta depois
  }
}
