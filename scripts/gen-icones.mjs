// Gera os ícones do app instalável a partir de código, sem depender de
// ferramenta de imagem instalada na máquina.
//
//   node scripts/gen-icones.mjs
//
// Produz public/icon-192.png, public/icon-512.png e public/favicon.svg.
// O desenho é uma nota de pedido branca sobre o verde da Verde Campo.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');

const VERDE = [0x1f, 0x6b, 0x2e];
const BRANCO = [0xff, 0xff, 0xff];

/** Distância de um ponto ao retângulo arredondado (negativa = dentro). */
function distRetangulo(x, y, cx, cy, larg, alt, raio) {
  const dx = Math.abs(x - cx) - (larg / 2 - raio);
  const dy = Math.abs(y - cy) - (alt / 2 - raio);
  const fora = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  return fora + Math.min(Math.max(dx, dy), 0) - raio;
}

/**
 * Cor de um ponto do ícone, em coordenadas de 0 a 1.
 * @returns {number[] | null} RGB, ou null para transparente
 */
function corDoPonto(u, v) {
  // fundo: quadrado levemente arredondado, sangrando até a borda. O Android
  // recorta o ícone no formato dele, então não dá para depender do canto.
  if (distRetangulo(u, v, 0.5, 0.5, 1, 1, 0.12) > 0) return null;

  // a nota: retângulo branco centrado, dentro dos 80% que o recorte preserva
  const naNota = distRetangulo(u, v, 0.5, 0.5, 0.46, 0.56, 0.05) <= 0;
  if (!naNota) return VERDE;

  // linhas da nota, a última mais curta como num total
  const linhas = [
    { y: 0.34, larg: 0.3 },
    { y: 0.45, larg: 0.3 },
    { y: 0.56, larg: 0.3 },
    { y: 0.67, larg: 0.16 },
  ];
  for (const l of linhas) {
    if (distRetangulo(u, v, 0.5, l.y, l.larg, 0.045, 0.022) <= 0) return VERDE;
  }
  return BRANCO;
}

/** Rasteriza com 4x de supersampling para as bordas saírem lisas. */
function desenhar(tamanho) {
  const AMOSTRAS = 4;
  const pixels = Buffer.alloc(tamanho * tamanho * 4);
  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < AMOSTRAS; sy++) {
        for (let sx = 0; sx < AMOSTRAS; sx++) {
          const u = (x + (sx + 0.5) / AMOSTRAS) / tamanho;
          const v = (y + (sy + 0.5) / AMOSTRAS) / tamanho;
          const cor = corDoPonto(u, v);
          if (cor) {
            r += cor[0];
            g += cor[1];
            b += cor[2];
            a += 255;
          }
        }
      }
      const total = AMOSTRAS * AMOSTRAS;
      const i = (y * tamanho + x) * 4;
      // as cores já vêm somadas só onde havia tinta; a média usa essa cobertura
      const cobertura = a / 255;
      pixels[i] = cobertura ? Math.round(r / cobertura) : 0;
      pixels[i + 1] = cobertura ? Math.round(g / cobertura) : 0;
      pixels[i + 2] = cobertura ? Math.round(b / cobertura) : 0;
      pixels[i + 3] = Math.round(a / total);
    }
  }
  return pixels;
}

// ---- codificação PNG (só o necessário: IHDR, IDAT, IEND) ----

const TABELA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABELA_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tipo, dados) {
  const tamanho = Buffer.alloc(4);
  tamanho.writeUInt32BE(dados.length);
  const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(corpo));
  return Buffer.concat([tamanho, corpo, crc]);
}

function png(tamanho, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tamanho, 0);
  ihdr.writeUInt32BE(tamanho, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // RGBA
  // cada linha é precedida pelo byte de filtro (0 = nenhum)
  const bruto = Buffer.alloc(tamanho * (tamanho * 4 + 1));
  for (let y = 0; y < tamanho; y++) {
    bruto[y * (tamanho * 4 + 1)] = 0;
    pixels.copy(
      bruto,
      y * (tamanho * 4 + 1) + 1,
      y * tamanho * 4,
      (y + 1) * tamanho * 4
    );
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(bruto, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const tamanho of [192, 512]) {
  const arquivo = path.join(root, `public/icon-${tamanho}.png`);
  fs.writeFileSync(arquivo, png(tamanho, desenhar(tamanho)));
  console.log(`icon-${tamanho}.png  ${fs.statSync(arquivo).size} bytes`);
}

// Mesma arte em vetor, para a aba do navegador.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="12" fill="#1F6B2E"/>
  <rect x="27" y="22" width="46" height="56" rx="5" fill="#fff"/>
  <g fill="#1F6B2E">
    <rect x="35" y="31.75" width="30" height="4.5" rx="2.2"/>
    <rect x="35" y="42.75" width="30" height="4.5" rx="2.2"/>
    <rect x="35" y="53.75" width="30" height="4.5" rx="2.2"/>
    <rect x="42" y="64.75" width="16" height="4.5" rx="2.2"/>
  </g>
</svg>
`;
fs.writeFileSync(path.join(root, 'public/favicon.svg'), svg, 'utf8');
console.log('favicon.svg atualizado');
