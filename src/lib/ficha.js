import JSZip from 'jszip';
import { FICHA_CADASTRO_B64 } from '../fichaCadastroBase64.js';

// ---- Ficha Cadastral: field → cell map (merge top-left cells, verified) ----
const FICHA_FIELD_MAP = {
  cnpj: 'C9',
  ie: 'I9',
  suframa: 'N9',
  razaoSocial: 'C10',
  nomeFantasia: 'C11',
  nomeAbrev: 'C12',
  logradouro: 'C15',
  numero: 'L15',
  complemento: 'N15',
  bairro: 'C16',
  municipio: 'K16',
  estado: 'P16',
  cep: 'C17',
  telefone: 'K17',
  ent_logradouro: 'C20',
  ent_numero: 'L20',
  ent_complemento: 'N20',
  ent_bairro: 'C21',
  ent_municipio: 'K21',
  ent_estado: 'P21',
  ent_cep: 'C22',
  ent_telefone: 'K22',
  cob_logradouro: 'C25',
  cob_numero: 'L25',
  cob_complemento: 'N25',
  cob_bairro: 'C26',
  cob_municipio: 'K26',
  cob_estado: 'P26',
  cob_cep: 'C27',
  cob_telefone: 'K27',
  fin_nome: 'C30',
  fin_telefone: 'I30',
  fin_email: 'L30',
  email_nf: 'C31',
  banco: 'C35',
  agencia: 'G35',
  conta: 'L35',
  forn1: 'C39',
  forn1_tel: 'I39',
  forn1_email: 'L39',
  forn2: 'C40',
  forn2_tel: 'I40',
  forn2_email: 'L40',
  forn3: 'C41',
  forn3_tel: 'I41',
  forn3_email: 'L41',
  resp_vendas: 'C44',
  cod_resp_vendas: 'L44',
  rede: 'C45',
  edi: 'M45',
  tabela_preco: 'C47',
  limite_credito: 'C48',
  prazo_pagamento: 'C49',
};

// Decode base64 to Uint8Array (browser-safe)
function b64ToUint8(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const escapeXmlCell = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Fill the original ficha .xlsx in-place (surgical XML edit — preserves 100% of layout,
// checkboxes, formatting, logo, formulas). Returns a Blob.
export async function gerarFichaCadastro(form) {
  const bytes = b64ToUint8(FICHA_CADASTRO_B64);
  const zip = await JSZip.loadAsync(bytes);
  let sheet = await zip.file('xl/worksheets/sheet1.xml').async('string');

  const injectCell = (xml, cell, value) => {
    if (value == null || value === '') return xml;
    const val = escapeXmlCell(value);
    // Empty self-closing cell: <c r="C10" s="84" />
    const reEmpty = new RegExp('<c r="' + cell + '"([^>/]*)/>');
    if (reEmpty.test(xml)) {
      return xml.replace(reEmpty, (m, attrs) => {
        const cleaned = attrs.replace(/\s+t="[^"]*"/, '');
        return `<c r="${cell}"${cleaned} t="inlineStr"><is><t xml:space="preserve">${val}</t></is></c>`;
      });
    }
    return xml; // cell not found or not empty — skip silently
  };

  Object.entries(FICHA_FIELD_MAP).forEach(([field, cell]) => {
    if (form[field]) sheet = injectCell(sheet, cell, form[field]);
  });

  zip.file('xl/worksheets/sheet1.xml', sheet);
  // Drop calcChain so Excel recalculates formulas (char counter, vendor VLOOKUP) on open
  if (zip.file('xl/calcChain.xml')) zip.remove('xl/calcChain.xml');

  const outBuf = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
  });
  return outBuf;
}


// Download the blank original ficha (safety net — untouched file)
export async function baixarFichaEmBranco() {
  const bytes = b64ToUint8(FICHA_CADASTRO_B64);
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Ficha_Cadastro_Cliente_EM_BRANCO.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
