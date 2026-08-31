import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { VC_GREEN, VC_GREEN_BG } from '../lib/constants.js';
import { formatBRL } from '../lib/format.js';
import {
  CUSTOM_IMAGES,
  saveCustomImage,
  removeCustomImage,
  compressImage,
} from '../lib/images.js';
import { calcItem } from '../lib/calc.js';
import { ProductImage } from './ProductImage.jsx';

export function ProductModal({ product, existing, onSave, onCancel, onRemove }) {
  const [caixas, setCaixas] = useState(existing?.caixas || 1);
  const [bonif, setBonif] = useState(existing?.bonif || 0);
  const [descPct, setDescPct] = useState(existing?.descPct || 0);
  const [isExtra, setIsExtra] = useState(existing?.isExtra || false);
  const [obs, setObs] = useState(existing?.obs || '');
  const [imgTick, setImgTick] = useState(0); // force re-render after image change
  const [imgBusy, setImgBusy] = useState(false);
  const imgInputRef = useRef(null);

  const c = calcItem({ codigo: product.codigo, caixas, bonif, descPct });
  const hasCustomImg = !!CUSTOM_IMAGES[product.codigo];

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
      await saveCustomImage(product.codigo, dataUrl);
      setImgTick((t) => t + 1);
    } catch {
      alert('Não consegui processar essa imagem. Tenta outra.');
    }
    setImgBusy(false);
  };

  const handleRemoveImg = async () => {
    await removeCustomImage(product.codigo);
    setImgTick((t) => t + 1);
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-xl p-5 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex flex-col items-center gap-1">
            <ProductImage key={imgTick} product={product} size={64} />
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
              className="text-[10px] text-stone-500 hover:text-stone-800 disabled:opacity-50"
            >
              {imgBusy ? '...' : hasCustomImg ? 'Trocar' : 'Add foto'}
            </button>
            {hasCustomImg && !imgBusy && (
              <button
                onClick={handleRemoveImg}
                className="text-[10px] text-red-500 hover:text-red-700 -mt-1"
              >
                Remover
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 text-sm leading-tight">
              {product.nome}
            </h3>
            <div className="text-xs text-stone-500 mt-1">
              <div>
                TOTVS: <span className="font-mono">{product.codigo}</span>
              </div>
              {product.sap && (
                <div>
                  SAP: <span className="font-mono">{product.sap}</span>
                </div>
              )}
              {product.ean && (
                <div>
                  EAN: <span className="font-mono">{product.ean}</span>
                </div>
              )}
              <div className="mt-1">
                {product.unidade === 'KG' && product.peso_kg ? (
                  <>
                    <span className="font-semibold text-amber-700">
                      Vendido por KG
                    </span>{' '}
                    · {product.un_cx} un/cx ·{' '}
                    {product.peso_kg.toString().replace('.', ',')} kg/cx ·{' '}
                    <span className="font-semibold text-stone-700">
                      {formatBRL(product.preco_st)}/kg
                    </span>
                  </>
                ) : (
                  <>
                    {product.un_cx} un/cx ·{' '}
                    <span className="font-semibold text-stone-700">
                      {formatBRL(product.preco_st)}
                    </span>
                    /cx
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">
                Caixas
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={caixas}
                onChange={(e) => setCaixas(e.target.value)}
                className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">
                Bonif.
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={bonif}
                onChange={(e) => setBonif(e.target.value)}
                className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 mb-1 block">
                Desc %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={descPct}
                onChange={(e) => setDescPct(e.target.value)}
                className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={isExtra}
              onChange={(e) => setIsExtra(e.target.checked)}
              className="rounded"
            />
            Marcar como sugestão (sai destacado na planilha)
          </label>

          <div>
            <label className="text-xs font-medium text-stone-600 mb-1 block">
              Observação do item (opcional)
            </label>
            <input
              type="text"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex: trocar lote, validade preferida..."
              className="w-full px-2 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2"
            />
          </div>

          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: VC_GREEN_BG }}
          >
            {c.isKg ? (
              <>
                <div className="flex justify-between text-xs text-stone-700">
                  <span>Total de unidades</span>
                  <span className="font-semibold">{c.totalUn} un</span>
                </div>
                <div className="flex justify-between text-xs text-stone-700 mt-0.5">
                  <span>Total de peso</span>
                  <span className="font-semibold">
                    {c.totalKg.toFixed(3).replace('.', ',')} kg
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-xs text-stone-700">
                <span>Total de unidades</span>
                <span className="font-semibold">{c.totalUn}</span>
              </div>
            )}
            <div
              className="flex justify-between text-sm font-bold mt-1"
              style={{ color: VC_GREEN }}
            >
              <span>Vl. Total</span>
              <span>{formatBRL(c.vlTotal)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {existing && (
              <button
                onClick={onRemove}
                className="px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                Remover
              </button>
            )}
            <button
              onClick={onCancel}
              className="flex-1 px-3 py-2.5 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                onSave(
                  product.codigo,
                  parseFloat(caixas) || 0,
                  parseFloat(bonif) || 0,
                  parseFloat(descPct) || 0,
                  isExtra,
                  obs
                )
              }
              disabled={!caixas || parseFloat(caixas) <= 0}
              className="flex-1 px-3 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
              style={{ backgroundColor: VC_GREEN }}
            >
              {existing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
