// Leitura/escrita de registros BIFF12 — o formato binário das planilhas .xlsb.
//
// Um .xlsb é um ZIP (igual ao .xlsx), mas cada aba é um `sheetN.bin` com um
// fluxo de registros binários no lugar do XML. Cada registro é:
//
//   [id: varint 1-2 bytes][tamanho: varint 1-4 bytes][conteúdo: N bytes]
//
// Só precisamos mexer em registros de célula, cujo conteúdo começa sempre com
// a estrutura `Cell` de 8 bytes: coluna (4) + estilo (3) + flags (1). Trocando
// um registro por outro com o mesmo `Cell` a célula muda de valor e mantém a
// formatação, as bordas e a validação de lista.

/** Registros que nos interessam (os demais são copiados sem interpretar). */
export const REC = {
  ROW_HDR: 0,
  CELL_BLANK: 1,
  CELL_RK: 2,
  CELL_ERROR: 3,
  CELL_BOOL: 4,
  CELL_REAL: 5,
  CELL_ST: 6, // string embutida no próprio registro
  CELL_ISST: 7, // índice na tabela de strings compartilhadas
  FMLA_STRING: 8,
  FMLA_NUM: 9,
};

const isCellRecord = (id) => id >= REC.CELL_BLANK && id <= REC.FMLA_NUM;

/** @param {number} id @returns {number[]} */
function encodeId(id) {
  if (id < 0x80) return [id];
  return [(id & 0x7f) | 0x80, (id >> 7) & 0x7f];
}

/** @param {number} len @returns {number[]} */
function encodeLen(len) {
  const out = [];
  let v = len;
  while (v >= 0x80) {
    out.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  out.push(v);
  return out;
}

/**
 * Percorre o fluxo de registros chamando `visit` para cada um.
 *
 * `visit` recebe o registro e devolve `null` para mantê-lo como está ou um
 * `Uint8Array` para substituí-lo. O resultado é um fluxo novo.
 *
 * @param {Uint8Array} bytes
 * @param {(rec: { id: number, row: number, col: number, payload: Uint8Array }) => Uint8Array | Uint8Array[] | null} visit
 * @returns {Uint8Array}
 */
export function mapRecords(bytes, visit) {
  /** @type {Uint8Array[]} */
  const out = [];
  let p = 0;
  let row = 0;

  while (p < bytes.length) {
    const start = p;

    let b = bytes[p++];
    let id = b & 0x7f;
    if (b & 0x80) {
      b = bytes[p++];
      id |= (b & 0x7f) << 7;
    }

    let len = 0;
    for (let i = 0; i < 4; i++) {
      b = bytes[p++];
      len |= (b & 0x7f) << (7 * i);
      if (!(b & 0x80)) break;
    }

    const payload = bytes.subarray(p, p + len);
    p += len;

    // O cabeçalho de linha define a linha das células que vêm depois dele.
    if (id === REC.ROW_HDR && len >= 4) {
      row = readU32(payload, 0) + 1;
    }

    let replacement = null;
    if (isCellRecord(id) && len >= 4) {
      replacement = visit({ id, row, col: readU32(payload, 0), payload });
    }
    // O visitante pode devolver vários registros para criar células novas
    // antes da que estava ali.
    if (Array.isArray(replacement)) out.push(...replacement);
    else out.push(replacement || bytes.subarray(start, p));
  }

  return concat(out);
}

/**
 * Monta um registro `BrtCellSt`: a célula passa a conter `text` como string
 * embutida, reaproveitando os 8 bytes de `Cell` (coluna/estilo/flags) do
 * registro original — é isso que preserva a formatação.
 *
 * @param {Uint8Array} cell 8 bytes iniciais do registro que está sendo trocado
 * @param {string} text
 * @returns {Uint8Array}
 */
export function cellStRecord(cell, text) {
  // XLWideString conta unidades UTF-16, não pontos de código.
  const units = text.length;
  const payloadLen = 8 + 4 + units * 2;
  const head = [...encodeId(REC.CELL_ST), ...encodeLen(payloadLen)];

  const rec = new Uint8Array(head.length + payloadLen);
  rec.set(head, 0);
  rec.set(cell.subarray(0, 8), head.length);

  const view = new DataView(rec.buffer);
  const cchAt = head.length + 8;
  view.setUint32(cchAt, units, true);
  for (let i = 0; i < units; i++) {
    view.setUint16(cchAt + 4 + i * 2, text.charCodeAt(i), true);
  }
  return rec;
}

/** @param {Uint8Array} b @param {number} off */
function readU32(b, off) {
  return (b[off] | (b[off + 1] << 8) | (b[off + 2] << 16) | (b[off + 3] << 24)) >>> 0;
}

/** @param {Uint8Array[]} parts @returns {Uint8Array} */
function concat(parts) {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/**
 * "A1" -> { row: 1, col: 0 }. Só precisamos de colunas de uma ou duas letras.
 * @param {string} ref
 */
export function parseRef(ref) {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) throw new Error(`Referência de célula inválida: ${ref}`);
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { row: Number(m[2]), col: col - 1 };
}

/**
 * Escreve texto em várias células de uma vez.
 *
 * Serve tanto para trocar o conteúdo de uma célula que já existe quanto para
 * criar uma que o modelo não tem. Criar é preciso porque as células de uma
 * linha vêm em ordem de coluna: a nova entra logo antes da primeira coluna
 * maior que ela, herdando o estilo dessa vizinha para não destoar.
 *
 * @param {Uint8Array} bytes fluxo de registros da aba
 * @param {Map<string, string>} valores chave `"linha:coluna"` -> texto
 * @param {(rec: { id: number, row: number, col: number }) => boolean} [pular]
 *   devolve true para deixar a célula como está
 * @returns {Uint8Array}
 */
export function escreverCelulas(bytes, valores, pular) {
  // colunas pendentes por linha, em ordem — o que ainda falta criar
  /** @type {Map<number, number[]>} */
  const aCriar = new Map();
  for (const chave of valores.keys()) {
    const [linha, coluna] = chave.split(':').map(Number);
    if (!aCriar.has(linha)) aCriar.set(linha, []);
    aCriar.get(linha).push(coluna);
  }
  for (const cols of aCriar.values()) cols.sort((a, b) => a - b);

  /** @param {number} col @param {Uint8Array} estilo 8 bytes de uma vizinha */
  const novaCelula = (col, estilo, texto) => {
    const cell = new Uint8Array(8);
    cell.set(estilo.subarray(0, 8));
    new DataView(cell.buffer).setUint32(0, col, true);
    return cellStRecord(cell, texto);
  };

  // Última célula vista na linha atual: doa o estilo para as que criarmos.
  /** @type {Uint8Array | null} */
  let ultimoEstilo = null;

  /** Emite as pendentes da linha com coluna menor que `limite`. */
  const criarAte = (row, limite) => {
    const cols = aCriar.get(row);
    if (!cols || !cols.length || !ultimoEstilo) return [];
    const saida = [];
    while (cols.length && cols[0] < limite) {
      const col = cols.shift();
      saida.push(novaCelula(col, ultimoEstilo, valores.get(`${row}:${col}`)));
    }
    return saida;
  };

  let linhaCorrente = 0;
  const resultado = mapRecords(bytes, (rec) => {
    const { id, row, col, payload } = rec;

    // Mudou de linha: o que sobrou da anterior vai para o fim dela.
    const pendentesDaAnterior =
      row !== linhaCorrente ? criarAte(linhaCorrente, Infinity) : [];
    if (row !== linhaCorrente) {
      linhaCorrente = row;
      ultimoEstilo = null;
    }

    const antes = criarAte(row, col);
    ultimoEstilo = payload;

    const chave = `${row}:${col}`;
    const cols = aCriar.get(row);
    if (cols) {
      const i = cols.indexOf(col);
      if (i !== -1) cols.splice(i, 1); // já existe, não precisa criar
    }

    const texto = valores.get(chave);
    const manter = texto === undefined || (pular && pular(rec));
    const propria = manter ? null : cellStRecord(payload, texto);

    if (!pendentesDaAnterior.length && !antes.length && !propria) return null;
    return [
      ...pendentesDaAnterior,
      ...antes,
      propria || bytesDoRegistro(id, payload),
    ];
  });

  // Uma célula só pode ser criada se houver, na mesma linha, alguma coluna
  // maior que ela para servir de âncora. Se sobrou pendência, o valor não foi
  // escrito — melhor estourar do que entregar planilha faltando dado.
  const sobraram = [];
  for (const [linha, cols] of aCriar) {
    for (const col of cols) sobraram.push(`${linha}:${col}`);
  }
  if (sobraram.length) {
    throw new Error(
      `Não consegui criar estas células no modelo: ${sobraram.join(', ')}`
    );
  }

  return resultado;
}

/** Reconstrói um registro a partir do id e do conteúdo (para reemitir igual). */
function bytesDoRegistro(id, payload) {
  const head = [...encodeId(id), ...encodeLen(payload.length)];
  const rec = new Uint8Array(head.length + payload.length);
  rec.set(head, 0);
  rec.set(payload, head.length);
  return rec;
}
