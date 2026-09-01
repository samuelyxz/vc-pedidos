import '@testing-library/jest-dom/vitest';
// jsdom não tem IndexedDB — necessário pro imageStore / CatalogContext / backup.
import 'fake-indexeddb/auto';

// jsdom não implementa estes — usados pelos exports (.xls / ficha .xlsx / imagem).
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:mock';
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => {};
}
