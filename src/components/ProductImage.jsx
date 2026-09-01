import { useState } from 'react';
import { VC_GREEN_BG, CAT_ICONS } from '../lib/constants.js';
import { proxyImage } from '../lib/images.js';
import { useCatalog } from '../state/CatalogContext.jsx';

// ProductImage component: prefers custom uploaded image, then catalog URL, then icon
export function ProductImage({ product, size = 48, className = '' }) {
  const { customImages } = useCatalog();
  const [failed, setFailed] = useState(false);
  const custom = product ? customImages[product.codigo] : null;
  const hasCustom = !!custom;
  const hasUrl = product?.imagem && !failed;
  const iconSize =
    size >= 48 ? 'text-2xl' : size >= 36 ? 'text-xl' : 'text-base';

  return (
    <div
      className={`rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, backgroundColor: VC_GREEN_BG }}
    >
      {hasCustom ? (
        <img
          src={custom}
          alt={product.nome}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      ) : hasUrl ? (
        <img
          src={proxyImage(product.imagem, Math.max(120, size * 2))}
          alt={product.nome}
          className="w-full h-full object-contain"
          onError={() => setFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={iconSize}>
          {CAT_ICONS[product?.categoria] || '📦'}
        </span>
      )}
    </div>
  );
}
