import { findProduct } from './catalog.js';
import { calcBonifItem, calcBonifTotal } from './calc.js';
import { formatDate, formatBRLPlain, escapeHtml, todayISO } from './format.js';

export const exportBonificacao = (bonif, cliente, vendedor, supervisor) => {
  const VC_DARK = '#375F5C';
  const items = bonif.items || [];
  const totalBonif = calcBonifTotal(items);
  const valorPedido = parseFloat(bonif.valorPedido) || 0;
  const mediaRSL = parseFloat(bonif.mediaRSL) || 0;

  let html =
    '\ufeff<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  html += `<head><meta charset="UTF-8">
<!--[if gte mso 9]><xml>
<x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Bonificação</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
</xml><![endif]-->
<style>
  table { border-collapse: collapse; font-family: Calibri, Arial, sans-serif; font-size: 10pt; }
  td { border: 1px solid #999; padding: 4px 6px; vertical-align: middle; }
  .title { background: ${VC_DARK} !important; color: #ffffff !important; font-weight: bold; font-size: 14pt; text-align: center; padding: 10px; }
  .thead { background: ${VC_DARK} !important; color: #ffffff !important; font-weight: bold; text-align: center; padding: 6px 4px; font-size: 9pt; }
  .label { background: #ededed !important; font-weight: bold; padding: 4px 8px; }
  .value { padding: 4px 8px; }
  .money { text-align: right; }
  .center { text-align: center; }
  .left { text-align: left; }
  .pct { text-align: center; }
</style></head><body>
<table>
<colgroup>
  <col style="width: 130pt;"><col style="width: 110pt;"><col style="width: 70pt;">
  <col style="width: 80pt;"><col style="width: 130pt;"><col style="width: 250pt;">
  <col style="width: 110pt;"><col style="width: 90pt;"><col style="width: 70pt;">
  <col style="width: 55pt;"><col style="width: 90pt;"><col style="width: 80pt;"><col style="width: 80pt;">
</colgroup>`;

  html += `<tr><td colspan="13" class="title">PLANILHA DE AUTORIZAÇÃO E LANÇAMENTOS DOS PEDIDOS DE BONIFICAÇÃO E DEGUSTAÇÃO</td></tr>`;
  html += `<tr><td colspan="13" style="border:none;height:6pt;"></td></tr>`;

  // Info header block
  html += `<tr>
    <td class="label">Nº Pedido Venda</td><td class="value center">${escapeHtml(
      bonif.numeroPedido || '-'
    )}</td>
    <td class="label">Valor Pedido Venda</td><td class="value money">${
      valorPedido > 0 ? formatBRLPlain(valorPedido) : '-'
    }</td>
    <td class="label">Média RSL (3 meses)</td><td class="value money">${
      mediaRSL > 0 ? formatBRLPlain(mediaRSL) : '-'
    }</td>
    <td class="label">Total Bonificação</td><td class="value money" style="font-weight:bold;">${formatBRLPlain(
      totalBonif
    )}</td>
    <td colspan="5" style="border:none;"></td>
  </tr>`;
  html += `<tr><td colspan="13" style="border:none;height:6pt;"></td></tr>`;

  // Table header
  html += `<tr>
    <td class="thead">Supervisor</td>
    <td class="thead">Vendedor</td>
    <td class="thead">Data</td>
    <td class="thead">Cod Cliente</td>
    <td class="thead">Rede</td>
    <td class="thead">Nome Fantasia</td>
    <td class="thead">Motivo da Bonificação</td>
    <td class="thead">Produto</td>
    <td class="thead">Cod Produto</td>
    <td class="thead">Qtd</td>
    <td class="thead">Unid Venda</td>
    <td class="thead">Valor Bonificação</td>
    <td class="thead">Bonif vs Pedido</td>
  </tr>`;

  // Item rows
  items.forEach((item) => {
    const p = findProduct(item.codigo);
    if (!p) return;
    const c = calcBonifItem(item);
    const bonifVsPedido = valorPedido > 0 ? c.valor / valorPedido : 0;
    html += `<tr>
      <td class="center">${escapeHtml(supervisor || '-')}</td>
      <td class="center">${escapeHtml(vendedor?.nome || '-')}</td>
      <td class="center">${formatDate(bonif.data)}</td>
      <td class="center">${escapeHtml(
        cliente?.codCliente || cliente?.cnpj || '-'
      )}</td>
      <td class="left">${escapeHtml(cliente?.rede || '-')}</td>
      <td class="left">${escapeHtml(
        cliente?.nomeFantasia || cliente?.razaoSocial || '-'
      )}</td>
      <td class="left">${escapeHtml(bonif.motivo || '-')}</td>
      <td class="left">${escapeHtml(p.descricao_original || p.nome)}</td>
      <td class="center">${escapeHtml(p.codigo)}</td>
      <td class="center">${item.qtd}</td>
      <td class="center">${c.unid}</td>
      <td class="money">${formatBRLPlain(c.valor)}</td>
      <td class="pct">${
        valorPedido > 0 ? (bonifVsPedido * 100).toFixed(1) + '%' : '-'
      }</td>
    </tr>`;
  });

  // Total row
  html += `<tr><td colspan="13" style="border:none;height:4pt;"></td></tr>`;
  html += `<tr>
    <td colspan="11" class="label" style="text-align:right;">TOTAL DA BONIFICAÇÃO</td>
    <td class="money" style="background:${VC_DARK} !important;color:#fff !important;font-weight:bold;">${formatBRLPlain(
    totalBonif
  )}</td>
    <td class="pct" style="background:${VC_DARK} !important;color:#fff !important;font-weight:bold;">${
    valorPedido > 0 ? ((totalBonif / valorPedido) * 100).toFixed(1) + '%' : '-'
  }</td>
  </tr>`;

  html += `</table></body></html>`;

  const clienteName = (
    cliente?.nomeFantasia ||
    cliente?.razaoSocial ||
    'Cliente'
  )
    .replace(/[^a-zA-Z0-9]/g, '_')
    .slice(0, 30);
  const filename = `Bonificacao_${clienteName}_${todayISO().replace(
    /-/g,
    ''
  )}.xls`;

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
