// Embute o modelo oficial de ficha de cadastro EM MASSA da Verde Campo.
//
//   node scripts/gen-ficha-massa.mjs [caminho/do/modelo.xlsb]
//
// As listas dos campos de escolha são as mesmas da ficha individual (conferido
// item a item), então este script só gera o template — os dropdowns continuam
// vindo de src/data/fichaBase.js, produzido por scripts/gen-ficha.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const src = process.argv[2] || path.join(root, 'assets/ficha-massa-2026-09.xlsb');
const bytes = fs.readFileSync(src);

fs.writeFileSync(
  path.join(root, 'src/data/fichaMassaTemplate.js'),
  `// GERADO POR scripts/gen-ficha-massa.mjs — não editar à mão.
// Origem: ${path.basename(src)}
// Modelo oficial em branco, byte a byte. O app injeta os valores e baixa.
export const FICHA_MASSA_B64 =
  '${bytes.toString('base64')}';
`,
  'utf8'
);

console.log(`ficha em massa: ${bytes.length} bytes -> base64`);
