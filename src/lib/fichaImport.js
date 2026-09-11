import * as XLSX from 'xlsx';
import { FICHA_CELLS } from './fichaCampos.js';

/** Aba de preenchimento do modelo individual. */
const ABA = 'FICHA INDIVIDUAL';

// Placeholder dos campos de lista num modelo em branco: não é valor escolhido.
const NAO_ESCOLHIDO = 'Selecionar';

/**
 * Lê de volta uma ficha cadastral que o app já gerou e devolve o formulário.
 *
 * Serve para recuperar fichas feitas antes de existir o histórico, e para
 * trazer para cá as que foram geradas em outro computador.
 *
 * @param {File | Blob} arquivo
 * @returns {Promise<Record<string, string>>}
 */
export async function lerFichaDeArquivo(arquivo) {
  const buffer = await arquivo.arrayBuffer();
  /** @type {import('xlsx').WorkBook} */
  let wb;
  try {
    wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  } catch {
    throw new Error('Não consegui abrir o arquivo. Ele é uma ficha gerada pelo app?');
  }

  const ws = wb.Sheets[ABA];
  if (!ws) {
    const temMassa = wb.SheetNames.some((n) => n.includes('CLIENTES DATASUL'));
    throw new Error(
      temMassa
        ? 'Esse é o modelo em massa. Importe as fichas individuais, uma de cada vez.'
        : 'Esse arquivo não parece uma ficha cadastral do modelo atual.'
    );
  }

  /** @type {Record<string, string>} */
  const form = {};
  for (const [campo, ref] of Object.entries(FICHA_CELLS)) {
    const celula = ws[ref];
    const valor = celula ? String(celula.w ?? celula.v ?? '').trim() : '';
    form[campo] = valor === NAO_ESCOLHIDO ? '' : valor;
  }

  if (!form.razaoSocial && !form.nomeFantasia && !form.cnpj) {
    throw new Error('A ficha está em branco — não há o que importar.');
  }
  return form;
}
