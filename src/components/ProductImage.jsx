import { useState, useEffect } from 'react';
import { VC_GREEN_BG, CAT_ICONS } from '../lib/constants.js';
import { proxyImage } from '../lib/images.js';
import {
  getCachedCatalogImage,
  putCachedCatalogImage,
} from '../lib/imageStore.js';
import { useCatalog } from '../state/CatalogContext.jsx';

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });

// ProductImage: tenta, em ordem, a foto customizada -> cache local (IndexedDB)
// -> proxy wsrv.nl -> URL direta da Verde Campo -> proxy com cache-buster ->
// ícone da categoria. Quando uma foto de rede carrega, guarda no cache local
// pra não depender mais do proxy nas próximas vezes.
export function ProductImage({ product, size = 48, className = '' }) {
  const { customImages } = useCatalog();
  const codigo = product?.codigo;
  const custom = codigo ? customImages[codigo] : null;

  const candidates = product?.imagem
    ? [
        proxyImage(product.imagem, Math.max(120, size * 2)),
        product.imagem,
        `${proxyImage(product.imagem, Math.max(120, size * 2))}&_r=1`,
      ]
    : [];

  const [cached, setCached] = useState(null);
  const [custErr, setCustErr] = useState(false);
  const [cacheErr, setCacheErr] = useState(false);
  const [net, setNet] = useState(0);

  // reseta o estado quando o produto muda (padrão "prev props" do React,
  // evita setState dentro de efeito)
  const [prevCodigo, setPrevCodigo] = useState(codigo);
  if (codigo !== prevCodigo) {
    setPrevCodigo(codigo);
    setCached(null);
    setCustErr(false);
    setCacheErr(false);
    setNet(0);
  }

  useEffect(() => {
    if (!codigo) return;
    let alive = true;
    getCachedCatalogImage(codigo)
      .then((d) => {
        if (alive && d) setCached(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [codigo]);

  let src = null;
  let isNetwork = false;
  if (custom && !custErr) {
    src = custom;
  } else if (cached && !cacheErr) {
    src = cached;
  } else if (net < candidates.length) {
    src = candidates[net];
    isNetwork = true;
  }

  const handleError = () => {
    if (custom && !custErr) setCustErr(true);
    else if (cached && !cacheErr) setCacheErr(true);
    else setNet((n) => n + 1);
  };

  const handleLoad = async () => {
    if (!isNetwork || !codigo || !src) return;
    try {
      const res = await fetch(src, { mode: 'cors' });
      if (!res.ok) return;
      const dataUrl = await blobToDataUrl(await res.blob());
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image')) {
        await putCachedCatalogImage(codigo, dataUrl);
      }
    } catch {
      // sem CORS (URL direta) ou falha de rede — segue sem cachear
    }
  };

  const iconSize =
    size >= 48 ? 'text-2xl' : size >= 36 ? 'text-xl' : 'text-base';

  return (
    <div
      className={`rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, backgroundColor: VC_GREEN_BG }}
    >
      {src ? (
        <img
          key={src}
          src={src}
          alt={product?.nome || ''}
          className="w-full h-full object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleError}
          onLoad={handleLoad}
        />
      ) : (
        <span className={iconSize}>{CAT_ICONS[product?.categoria] || '📦'}</span>
      )}
    </div>
  );
}
