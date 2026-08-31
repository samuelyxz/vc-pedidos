import { SECAO_ORDER } from './constants.js';
import { findProduct } from './catalog.js';
import { calcItem, calcOrder } from './calc.js';
import { formatDate, formatBRLPlain, formatKgPlain, escapeHtml, todayISO } from './format.js';

export const exportPedidoStyled = (pedido, cliente, vendedor) => {
  // Group items by section
  const grouped = {};
  pedido.items.forEach((item) => {
    const p = findProduct(item.codigo);
    if (!p) return;
    const sect = p.secao || 'OUTROS';
    if (!grouped[sect]) grouped[sect] = [];
    grouped[sect].push({ item, p });
  });

  // Sort sections by template order
  const sortedSections = Object.keys(grouped).sort((a, b) => {
    const ia = SECAO_ORDER.indexOf(a);
    const ib = SECAO_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const { total, totalCaixas, totalBonif, totalKg } = calcOrder(pedido.items);
  const hasExtras = pedido.items.some((i) => i.isExtra);

  let html =
    '\ufeff<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += `<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml>
<x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Pedido</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
</xml><![endif]-->
<style>
  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 10pt; }
  td { border: 1px solid #777; padding: 4px 6px; vertical-align: middle; mso-pattern: auto none; }
  .title { background: #2a2a2a !important; color: #ffffff !important; font-weight: bold; font-size: 14pt; text-align: center; padding: 10px; letter-spacing: 1px; }
  .subtitle { background: #3a3a3a !important; color: #ffffff !important; font-weight: bold; font-size: 10pt; text-align: center; padding: 6px; letter-spacing: 0.5px; }
  .label { background: #ededed !important; font-weight: bold; padding: 4px 8px; }
  .value { padding: 4px 8px; }
  .section { background: #c8c8c8 !important; font-weight: bold; font-size: 11pt; padding: 6px 10px; text-align: left; letter-spacing: 0.5px; }
  .thead { background: #2a2a2a !important; color: #ffffff !important; font-weight: bold; text-align: center; padding: 6px 4px; font-size: 9.5pt; }
  .total-label { background: #2a2a2a !important; color: #ffffff !important; font-weight: bold; font-size: 12pt; text-align: right; padding: 8px; letter-spacing: 0.5px; }
  .total-val { background: #2a2a2a !important; color: #ffffff !important; font-weight: bold; font-size: 12pt; text-align: right; padding: 8px; }
  .extra { background: #fff5cc !important; }
  .money { text-align: right; }
  .pct { mso-number-format: '0.00\\%'; text-align: center; }
  .num { mso-number-format: '0'; text-align: center; }
  .kg { text-align: center; }
  .text { mso-number-format: '\\@'; text-align: center; font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; }
  .code { mso-number-format: '\\@'; text-align: center; font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; }
  .left { text-align: left; }
  .footer { font-size: 9pt; padding: 6px 8px; background: #f5f5f5 !important; font-style: italic; }
  .summary-label { background: #ededed !important; font-weight: bold; padding: 6px 8px; text-align: center; }
</style></head><body>
<table>
<colgroup>
  <col style="width: 90pt;">
  <col style="width: 95pt;">
  <col style="width: 110pt;">
  <col style="width: 240pt;">
  <col style="width: 55pt;">
  <col style="width: 55pt;">
  <col style="width: 55pt;">
  <col style="width: 65pt;">
  <col style="width: 80pt;">
  <col style="width: 55pt;">
  <col style="width: 90pt;">
</colgroup>`;

  // Title
  html += `<tr><td colspan="11" class="title">PEDIDO DE VENDA${
    pedido.numero ? ` &mdash; Nº ${pedido.numero}` : ''
  }</td></tr>`;
  html += `<tr><td colspan="11" class="subtitle">LATICÍNIOS VERDE CAMPO S.A.</td></tr>`;

  // Empty separator
  html += `<tr><td colspan="11" style="border: none; height: 6pt;"></td></tr>`;

  // Cliente + Pedido info (two columns)
  html += `<tr>
    <td colspan="6" class="label" style="text-align: center; background: #d9d9d9 !important;">DADOS DO CLIENTE</td>
    <td colspan="5" class="label" style="text-align: center; background: #d9d9d9 !important;">DADOS DO PEDIDO</td>
  </tr>`;
  html += `<tr>
    <td class="label">Razão Social</td><td colspan="5" class="value">${escapeHtml(
      cliente?.razaoSocial || '-'
    )}</td>
    <td class="label">Data</td><td colspan="4" class="value" style="text-align: center;">${formatDate(
      pedido.data
    )}</td>
  </tr>`;
  html += `<tr>
    <td class="label">CNPJ</td><td colspan="5" class="value code" style="text-align: left;">${escapeHtml(
      cliente?.cnpj || '-'
    )}</td>
    <td class="label">Nº Pedido</td><td colspan="4" class="value" style="text-align: center;">${escapeHtml(
      pedido.numero || '-'
    )}</td>
  </tr>`;
  html += `<tr>
    <td class="label">IE</td><td colspan="5" class="value code" style="text-align: left;">${escapeHtml(
      cliente?.ie || '-'
    )}</td>
    <td class="label">Vendedor</td><td colspan="4" class="value">${escapeHtml(
      vendedor?.nome || '-'
    )}</td>
  </tr>`;
  html += `<tr>
    <td class="label">Telefone</td><td colspan="5" class="value text" style="text-align: left;">${escapeHtml(
      cliente?.telefone || '-'
    )}</td>
    <td class="label">Tel. Vendedor</td><td colspan="4" class="value text" style="text-align: left;">${escapeHtml(
      vendedor?.telefone || '-'
    )}</td>
  </tr>`;
  html += `<tr>
    <td class="label">Endereço</td><td colspan="5" class="value">${escapeHtml(
      cliente?.endereco || '-'
    )}${
    cliente?.cidade
      ? ` &mdash; ${escapeHtml(cliente.cidade)}${
          cliente.uf ? '/' + escapeHtml(cliente.uf) : ''
        }`
      : ''
  }</td>
    <td class="label">E-mail Vend.</td><td colspan="4" class="value">${escapeHtml(
      vendedor?.email || '-'
    )}</td>
  </tr>`;
  html += `<tr>
    <td class="label">Contato</td><td colspan="5" class="value">${escapeHtml(
      cliente?.contato || '-'
    )}</td>
    <td class="label">Total Itens</td><td colspan="4" class="value" style="text-align: center;">${
      pedido.items.length
    } produto${
    pedido.items.length !== 1 ? 's' : ''
  } &middot; ${totalCaixas} caixa${totalCaixas !== 1 ? 's' : ''}</td>
  </tr>`;

  // Empty separator
  html += `<tr><td colspan="11" style="border: none; height: 6pt;"></td></tr>`;

  // Products table header
  html += `<tr>
    <td class="thead">Cód. SAP</td>
    <td class="thead">Cód. TOTVS</td>
    <td class="thead">Cód. EAN</td>
    <td class="thead">Produto</td>
    <td class="thead">Caixas</td>
    <td class="thead">Bonif.</td>
    <td class="thead">Un/Cx</td>
    <td class="thead">Total Un.</td>
    <td class="thead">Valor Unit.</td>
    <td class="thead">Desc%</td>
    <td class="thead">Vl. Total</td>
  </tr>`;

  // Products by section
  sortedSections.forEach((section) => {
    html += `<tr><td colspan="11" class="section">${escapeHtml(
      section
    )}</td></tr>`;
    grouped[section].forEach(({ item, p }) => {
      const c = calcItem(item);
      const cls = item.isExtra ? ' extra' : '';
      const descVal = parseFloat(item.descPct) || 0;
      const nomeProduto =
        escapeHtml(p.nome) +
        (c.isKg
          ? ` <span style="font-size: 8pt; color: #555;">(${p.peso_kg
              .toString()
              .replace('.', ',')} kg/cx)</span>`
          : '');
      const totalCell = c.isKg
        ? `<td class="kg${cls}">${formatKgPlain(c.totalKg)}</td>`
        : `<td class="num${cls}">${c.totalUn}</td>`;
      const vlUnitDisplay = c.isKg
        ? `<td class="money${cls}">${formatBRLPlain(
            c.vlUnit
          )}<span style="font-size: 8pt;"> /kg</span></td>`
        : `<td class="money${cls}">${formatBRLPlain(c.vlUnit)}</td>`;
      html += `<tr>
        <td class="code${cls}">${escapeHtml(p.sap || '-')}</td>
        <td class="code${cls}" style="font-weight: bold;">${escapeHtml(
        p.codigo
      )}</td>
        <td class="code${cls}">${escapeHtml(p.ean || '-')}</td>
        <td class="left${cls}">${nomeProduto}${
        item.obs
          ? `<br><span style="font-size: 8pt; color: #555;">Obs: ${escapeHtml(
              item.obs
            )}</span>`
          : ''
      }</td>
        <td class="num${cls}">${item.caixas}</td>
        <td class="num${cls}">${item.bonif || 0}</td>
        <td class="num${cls}">${p.un_cx}</td>
        ${totalCell}
        ${vlUnitDisplay}
        <td class="num${cls}">${descVal > 0 ? descVal + '%' : '-'}</td>
        <td class="money${cls}" style="font-weight: bold;">${formatBRLPlain(
        c.vlTotal
      )}</td>
      </tr>`;
    });
  });

  // Summary row
  html += `<tr><td colspan="11" style="border: none; height: 4pt;"></td></tr>`;
  const summaryText =
    `Total de Caixas: ${totalCaixas}` +
    (totalKg > 0 ? ` &middot; Peso Total: ${formatKgPlain(totalKg)}` : '') +
    (totalBonif > 0 ? ` &middot; Bonificação: ${totalBonif}` : '');
  html += `<tr>
    <td colspan="4" class="summary-label">${summaryText}</td>
    <td colspan="6" class="total-label">TOTAL DO PEDIDO</td>
    <td class="total-val">${formatBRLPlain(total)}</td>
  </tr>`;

  // Observations
  if (pedido.obs) {
    html += `<tr><td colspan="11" style="border: none; height: 4pt;"></td></tr>`;
    html += `<tr>
      <td class="label">Observações</td>
      <td colspan="10" class="value">${escapeHtml(pedido.obs)}</td>
    </tr>`;
  }

  // Extras note
  if (hasExtras) {
    html += `<tr><td colspan="11" class="footer">📌 Itens destacados em fundo amarelo claro são sugestões adicionadas ao pedido original do cliente.</td></tr>`;
  }

  // Footer
  html += `<tr><td colspan="11" style="border: none; height: 6pt;"></td></tr>`;
  html += `<tr>
    <td colspan="11" class="footer">Fornecedor: LATICÍNIOS VERDE CAMPO S.A. &middot; Av. Luiz Gomide, Lavras-MG &middot; CNPJ: 07.757.005/0001-02 &middot; Frete a pagar &middot; Transportadora: __________</td>
  </tr>`;

  html += `</table></body></html>`;

  const clienteName = (cliente?.razaoSocial || 'Cliente')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 30);
  const numero = pedido.numero || todayISO().replace(/-/g, '');
  const filename = `Pedido_${numero}_${clienteName}.xls`;

  const blob = new Blob([html], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
