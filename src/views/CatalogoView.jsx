import { useState, useMemo, useRef } from 'react';
import { Search } from 'lucide-react';
import { VC_GREEN, CAT_ICONS, CAT_ORDER } from '../lib/constants.js';
import { formatBRL } from '../lib/format.js';
import { compressImage } from '../lib/images.js';
import { useCatalog } from '../state/CatalogContext.jsx';
import { ProductImage } from '../components/ProductImage.jsx';

// ============== CATÁLOGO ==============
export function CatalogoView() {
  const { products } = useCatalog();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return products.filter((p) => {
      if (catFilter !== 'all' && p.categoria !== catFilter) return false;
      if (!s) return true;
      return (
        p.nome.toLowerCase().includes(s) ||
        p.codigo.toLowerCase().includes(s) ||
        (p.sap && p.sap.includes(s))
      );
    });
  }, [search, catFilter, products]);

  const stats = useMemo(() => {
    const total = products.length;
    const byCat = {};
    products.forEach((p) => {
      byCat[p.categoria] = (byCat[p.categoria] || 0) + 1;
    });
    return { total, byCat };
  }, [products]);

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <h2 className="text-xl font-semibold text-stone-900 mb-1 hidden md:block">
        Catálogo
      </h2>
      <p className="text-sm text-stone-500 mb-4 hidden md:block">
        {stats.total} produtos cadastrados
      </p>

      <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto, TOTVS, SAP..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCatFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              catFilter === 'all' ? 'text-white' : 'bg-stone-100 text-stone-700'
            }`}
            style={catFilter === 'all' ? { backgroundColor: VC_GREEN } : {}}
          >
            Todos ({stats.total})
          </button>
          {CAT_ORDER.map(
            (cat) =>
              stats.byCat[cat] && (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    catFilter === cat
                      ? 'text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                  style={catFilter === cat ? { backgroundColor: VC_GREEN } : {}}
                >
                  {CAT_ICONS[cat]} {cat} ({stats.byCat[cat]})
                </button>
              )
          )}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((p) => (
          <CatalogoItem key={p.codigo} product={p} />
        ))}
      </div>
    </div>
  );
}

function CatalogoItem({ product: p }) {
  const { customImages, setProductImage, removeProductImage } = useCatalog();
  const [imgBusy, setImgBusy] = useState(false);
  const imgInputRef = useRef(null);
  const hasCustomImg = !!customImages[p.codigo];

  const handleImgFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem.');
      return;
    }
    setImgBusy(true);
    try {
      const dataUrl = await compressImage(file, 200);
      await setProductImage(p.codigo, dataUrl);
    } catch {
      alert('Não consegui processar essa imagem. Tenta outra.');
    }
    setImgBusy(false);
  };

  const handleRemoveImg = async () => {
    await removeProductImage(p.codigo);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3 flex items-center gap-3">
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
        <ProductImage product={p} size={48} />
        <input
          type="file"
          accept="image/*"
          ref={imgInputRef}
          onChange={handleImgFile}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => imgInputRef.current?.click()}
          disabled={imgBusy}
          className="text-[9px] text-stone-400 hover:text-stone-700 disabled:opacity-50 leading-tight"
        >
          {imgBusy ? '...' : hasCustomImg ? 'trocar' : '+ foto'}
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-stone-900 text-sm">{p.nome}</span>
          {p.status && (
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                p.status.toLowerCase().includes('lan')
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              {p.status.toLowerCase().includes('lan')
                ? 'LANÇ.'
                : p.status.toLowerCase().includes('nov')
                ? 'NOVO'
                : 'DESCONT.'}
            </span>
          )}
          {hasCustomImg && (
            <button
              onClick={handleRemoveImg}
              className="text-[9px] text-red-400 hover:text-red-600"
            >
              remover foto
            </button>
          )}
        </div>
        <div className="text-xs text-stone-500 mt-0.5">
          TOTVS: {p.codigo}
          {p.sap ? ` · SAP: ${p.sap}` : ''} · {p.un_cx} un/cx
          {p.unidade === 'KG' && p.peso_kg
            ? ` (${p.peso_kg.toString().replace('.', ',')}kg)`
            : ''}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-sm" style={{ color: VC_GREEN }}>
          {formatBRL(p.preco_st)}
        </div>
        {p.unidade === 'KG' && (
          <div className="text-[10px] text-amber-700 font-medium">/kg</div>
        )}
      </div>
    </div>
  );
}
