// Regenera os dados da ficha cadastral a partir do .xlsb oficial da Verde Campo.
//
//   node scripts/gen-ficha.mjs [caminho/do/modelo.xlsb]
//
// Produz dois arquivos em src/data:
//   fichaTemplate.js  -> o .xlsb inteiro em base64 (o app preenche e baixa)
//   fichaBase.js      -> as listas da aba "base" que alimentam os dropdowns
//
// Quando a empresa mandar um modelo novo: substitua o arquivo em assets/,
// rode este script e confira os testes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const src = process.argv[2] || path.join(root, 'assets/ficha-modelo-2026-09.xlsb');
const bytes = fs.readFileSync(src);

const wb = XLSX.read(bytes, { type: 'buffer' });
const base = wb.Sheets['base'];
if (!base) throw new Error('O modelo não tem a aba "base".');

const range = XLSX.utils.decode_range(base['!ref']);

// Lê uma coluna inteira da aba "base", descartando o cabeçalho e o placeholder
// "Selecionar" — o que sobra são as opções válidas do dropdown.
function coluna(letra) {
  const c = XLSX.utils.decode_col(letra);
  const out = [];
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cell = base[XLSX.utils.encode_cell({ r, c })];
    if (!cell) continue;
    const v = String(cell.w ?? cell.v ?? '').trim();
    if (!v || v === 'Selecionar') continue;
    out.push({ row: r, v });
  }
  return out;
}

// Cabeçalho fica na primeira linha preenchida; o resto são opções.
const opcoes = (letra) => coluna(letra).slice(1).map((x) => x.v);

// Representante e Banco vêm em pares (nome, código) alinhados por linha: o
// VLOOKUP da ficha usa isso, então guardamos o par para poder mostrar o código.
function pares(letraNome, letraCod) {
  const nomes = coluna(letraNome).slice(1);
  // A coluna de códigos nem sempre tem cabeçalho, então casamos por linha em
  // vez de cortar o topo — cortar às cegas desalinhava o par inteiro.
  const cods = new Map(coluna(letraCod).map((x) => [x.row, x.v]));
  return nomes.map(({ row, v }) => ({ nome: v, codigo: cods.get(row) || '' }));
}

const dados = {
  representantes: pares('E', 'F'),
  bancos: pares('P', 'Q'),
  tabelas: opcoes('H'),
  formasPagamento: opcoes('I'),
  edi: opcoes('L'),
  fretes: opcoes('N'),
};

const aviso = `// GERADO POR scripts/gen-ficha.mjs — não editar à mão.
// Origem: ${path.basename(src)}
`;

fs.writeFileSync(
  path.join(root, 'src/data/fichaBase.js'),
  aviso +
    `
/** @typedef {{ nome: string, codigo: string }} OpcaoComCodigo */

/** @type {OpcaoComCodigo[]} */
export const REPRESENTANTES = ${JSON.stringify(dados.representantes, null, 2)};

/** @type {OpcaoComCodigo[]} */
export const BANCOS = ${JSON.stringify(dados.bancos, null, 2)};

/** @type {string[]} */
export const TABELAS_PRECO = ${JSON.stringify(dados.tabelas, null, 2)};

/** @type {string[]} */
export const FORMAS_PAGAMENTO = ${JSON.stringify(dados.formasPagamento)};

/** @type {string[]} */
export const OPCOES_EDI = ${JSON.stringify(dados.edi)};

/** @type {string[]} */
export const MODALIDADES_FRETE = ${JSON.stringify(dados.fretes)};
`,
  'utf8'
);

fs.writeFileSync(
  path.join(root, 'src/data/fichaTemplate.js'),
  aviso +
    `// Modelo oficial em branco, byte a byte. O app injeta os valores e baixa.
export const FICHA_XLSB_B64 =
  '${bytes.toString('base64')}';
`,
  'utf8'
);

console.log(`ficha: ${bytes.length} bytes -> base64`);
for (const [k, v] of Object.entries(dados)) console.log(`  ${k}: ${v.length}`);
