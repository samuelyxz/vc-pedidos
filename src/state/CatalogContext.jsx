import { createContext, useContext, useEffect, useState } from 'react';
import { store } from '../lib/storage.js';
import { DEFAULT_PRODUCTS } from '../data/products.js';
import { setProducts as syncProductsSingleton } from '../lib/catalog.js';
import {
  getAllImages,
  putImage,
  deleteImage,
  migrateLegacyImages,
} from '../lib/imageStore.js';

const DEFAULT_META = { source: 'default', updatedAt: null, filename: '' };

const CatalogContext = createContext(null);

// Fonte única do estado do catálogo (produtos, metadados e imagens customizadas).
// Substitui o antigo singleton mutável + contador `catVersion`.
export function CatalogProvider({ children }) {
  const [products, setProductsState] = useState(DEFAULT_PRODUCTS);
  const [catMeta, setCatMeta] = useState(DEFAULT_META);
  const [customImages, setCustomImages] = useState({});
  const [ready, setReady] = useState(false);

  // Mantém o singleton de lib/catalog.js em dia para os helpers puros
  // (findProduct -> calcItem / exportPedido / exportBonificacao).
  useEffect(() => {
    syncProductsSingleton(products);
  }, [products]);

  useEffect(() => {
    (async () => {
      const storedCat = await store.get('catalogo');
      if (Array.isArray(storedCat) && storedCat.length > 0) {
        setProductsState(storedCat);
      }
      setCatMeta(await store.get('catalogo_meta', DEFAULT_META));
      try {
        await migrateLegacyImages();
        setCustomImages(await getAllImages());
      } catch {
        // IndexedDB indisponível (aba anônima, etc.) — segue sem fotos custom
        setCustomImages({});
      }
      setReady(true);
    })();
  }, []);

  const updateCatalog = async (newProducts, filename) => {
    const meta = {
      source: 'upload',
      updatedAt: new Date().toISOString(),
      filename: filename || '',
    };
    setProductsState(newProducts);
    setCatMeta(meta);
    await store.set('catalogo', newProducts);
    await store.set('catalogo_meta', meta);
  };

  const resetCatalog = async () => {
    setProductsState([...DEFAULT_PRODUCTS]);
    setCatMeta(DEFAULT_META);
    await store.delete('catalogo');
    await store.set('catalogo_meta', DEFAULT_META);
  };

  const setProductImage = async (codigo, dataUrl) => {
    setCustomImages((prev) => ({ ...prev, [codigo]: dataUrl }));
    await putImage(codigo, dataUrl);
  };

  const removeProductImage = async (codigo) => {
    setCustomImages((prev) => {
      const next = { ...prev };
      delete next[codigo];
      return next;
    });
    await deleteImage(codigo);
  };

  return (
    <CatalogContext.Provider
      value={{
        products,
        catMeta,
        customImages,
        ready,
        updateCatalog,
        resetCatalog,
        setProductImage,
        removeProductImage,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

// Hook e Provider juntos é o padrão idiomático de Context; o aviso de fast-refresh
// não se aplica (o hook não é um componente).
// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error('useCatalog() precisa estar dentro de <CatalogProvider>.');
  }
  return ctx;
}
