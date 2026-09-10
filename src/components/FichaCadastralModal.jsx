import { useEffect, useState } from 'react';
import { Download, X, RefreshCw, FileDown, RotateCcw } from 'lucide-react';
import { VC_GREEN } from '../lib/constants.js';
import {
  exportarFichaCadastro,
  baixarFichaEmBranco,
  normalizarTexto,
} from '../lib/ficha.js';
import {
  lerRascunho,
  salvarRascunho,
  limparRascunho,
  rotuloRascunho,
} from '../lib/fichaRascunho.js';
import { salvarFicha } from '../lib/fichasSalvas.js';
import {
  exportarFichaLegada,
  baixarFichaLegadaEmBranco,
} from '../lib/fichaLegado.js';
import {
  REPRESENTANTES,
  BANCOS,
  TABELAS_PRECO,
  FORMAS_PAGAMENTO,
  OPCOES_EDI,
  MODALIDADES_FRETE,
} from '../data/fichaBase.js';
import { useToast } from '../state/ToastContext.jsx';
import { Field, Select, Combo } from './Field.jsx';
import { Modal } from './Modal.jsx';

function Sec({ children }) {
  return (
    <div
      className="text-xs font-bold text-white px-2 py-1 rounded mt-3 mb-2"
      style={{ backgroundColor: VC_GREEN }}
    >
      {children}
    </div>
  );
}

// Obrigatórios segundo a aba "Orientações Preenchimento" do modelo oficial.
const OBRIGATORIOS = [
  ['cnpj', 'CNPJ'],
  ['ie', 'Inscrição Estadual'],
  ['razaoSocial', 'Razão Social'],
  ['nomeAbrev', 'Nome Abreviado'],
  ['logradouro', 'Logradouro'],
  ['numero', 'Nº'],
  ['bairro', 'Bairro'],
  ['cep', 'CEP'],
  ['municipio', 'Município'],
  ['estado', 'Estado'],
  ['telefone', 'Telefone'],
  ['fin_email', 'E-mail'],
  ['resp_vendas', 'Responsável de Vendas'],
];

const VAZIO = {
  cnpj: '',
  ie: '',
  razaoSocial: '',
  nomeFantasia: '',
  nomeAbrev: '',
  suframa: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cep: '',
  municipio: '',
  estado: '',
  complemento: '',
  telefone: '',
  cob_logradouro: '',
  cob_numero: '',
  cob_bairro: '',
  cob_cep: '',
  cob_municipio: '',
  cob_estado: '',
  cob_complemento: '',
  cob_telefone: '',
  ent_logradouro: '',
  ent_numero: '',
  ent_bairro: '',
  ent_cep: '',
  ent_municipio: '',
  ent_estado: '',
  ent_complemento: '',
  ent_telefone: '',
  fin_nome: '',
  fin_email: '',
  email_nf: '',
  fin_telefone: '',
  banco: '',
  agencia: '',
  conta: '',
  resp_vendas: '',
  filial: '',
  tabela_preco: '',
  edi: '',
  frete: '',
  limite_credito: '',
  prazo_pagamento: '',
  forma_pagamento: '',
  forn1: '',
  forn2: '',
  forn3: '',
};

/** O que dá para aproveitar do cliente já cadastrado. */
function doCliente(seed) {
  return {
    ...VAZIO,
    cnpj: seed.cnpj || '',
    ie: seed.ie || '',
    razaoSocial: seed.razaoSocial || '',
    nomeFantasia: seed.nomeFantasia || '',
    nomeAbrev: (seed.nomeFantasia || seed.razaoSocial || '').slice(0, 12),
    logradouro: seed.endereco || '',
    municipio: seed.cidade || '',
    estado: seed.uf || '',
    cep: seed.cep || '',
    telefone: seed.telefone || '',
    fin_nome: seed.contato || '',
    fin_email: seed.email || '',
  };
}

export function FichaCadastralModal({
  clienteInicial = null,
  fichaInicial = null,
  fichaId = null,
  onClose,
}) {
  const { notify, confirm } = useToast();
  // `fichaInicial` vem de uma ficha já salva (revisão ou cópia para filial);
  // sem ela, o que dá para aproveitar é o cadastro do cliente.
  const [inicial] = useState(() =>
    fichaInicial
      ? { ...VAZIO, ...fichaInicial }
      : doCliente(clienteInicial || {})
  );
  const [form, setForm] = useState(inicial);
  const [busy, setBusy] = useState(false);
  const [rascunho, setRascunho] = useState(null);

  // "Alterado" = tem trabalho a perder. É o que decide se vale salvar rascunho
  // e se fechar precisa perguntar.
  const alterado = JSON.stringify(form) !== JSON.stringify(inicial);

  // Guarda o preenchimento a cada mudança, para clicar fora sem querer, fechar
  // a aba ou o navegador travar não custarem o formulário inteiro.
  useEffect(() => {
    if (alterado) salvarRascunho(form);
  }, [form, alterado]);

  useEffect(() => {
    // Abrindo uma ficha salva, oferecer um rascunho de outra só confundiria.
    if (fichaInicial) return;
    (async () => {
      const r = await lerRascunho();
      if (r && rotuloRascunho(r.form)) setRascunho(r);
    })();
  }, [fichaInicial]);

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // O código sai de um VLOOKUP dentro da planilha; aqui é só espelho, para o
  // usuário conferir que escolheu o nome certo antes de gerar.
  const codBanco = BANCOS.find((b) => b.nome === form.banco)?.codigo || '';
  const codRep =
    REPRESENTANTES.find((r) => r.nome === form.resp_vendas)?.codigo || '';

  const tabelaInvalida =
    form.tabela_preco !== '' && !TABELAS_PRECO.includes(form.tabela_preco);

  const copiarEndereco = () => {
    setForm((f) => ({
      ...f,
      cob_logradouro: f.logradouro,
      cob_numero: f.numero,
      cob_bairro: f.bairro,
      cob_cep: f.cep,
      cob_municipio: f.municipio,
      cob_estado: f.estado,
      cob_complemento: f.complemento,
      cob_telefone: f.telefone,
      ent_logradouro: f.logradouro,
      ent_numero: f.numero,
      ent_bairro: f.bairro,
      ent_cep: f.cep,
      ent_municipio: f.municipio,
      ent_estado: f.estado,
      ent_complemento: f.complemento,
      ent_telefone: f.telefone,
    }));
  };

  const gerar = async () => {
    if (tabelaInvalida) {
      notify('A Tabela de Preço precisa ser um item da lista.', {
        type: 'error',
      });
      return;
    }
    const faltando = OBRIGATORIOS.filter(([k]) => !form[k].trim()).map(
      ([, rotulo]) => rotulo
    );
    if (faltando.length) {
      const ok = await confirm(
        `A Verde Campo pede estes campos: ${faltando.join(', ')}. Gerar assim mesmo?`,
        { confirmText: 'Gerar assim mesmo', cancelText: 'Voltar e preencher' }
      );
      if (!ok) return;
    }
    setBusy(true);
    try {
      await exportarFichaCadastro(form);
      // fica no histórico para conferir depois e aproveitar em outra filial
      await salvarFicha(form, fichaId);
      // ficha na mão: o rascunho cumpriu o papel dele
      await limparRascunho();
      notify('Ficha gerada e guardada no histórico.');
    } catch {
      notify('Erro ao gerar a ficha. Tente novamente.', { type: 'error' });
    }
    setBusy(false);
  };

  // Clicar fora, ESC e o X passam por aqui: com o formulário mexido, fechar
  // sem querer era perder tudo.
  const fechar = async () => {
    if (!alterado) {
      onClose();
      return;
    }
    const ok = await confirm(
      'Fechar a ficha? O preenchimento fica guardado e você pode continuar depois.',
      { confirmText: 'Fechar sem terminar', cancelText: 'Continuar preenchendo' }
    );
    if (ok) onClose();
  };

  const retomarRascunho = () => {
    // Sobre VAZIO de propósito: um rascunho gravado por uma versão anterior
    // pode não ter todos os campos, e campo faltando quebraria a tela.
    setForm({ ...VAZIO, ...rascunho.form });
    setRascunho(null);
  };

  const descartarRascunho = async () => {
    setRascunho(null);
    await limparRascunho();
  };

  const gerarLegada = async () => {
    setBusy(true);
    try {
      const nome =
        normalizarTexto(form.nomeFantasia || form.razaoSocial)
          .replace(/[^A-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 30) || 'CLIENTE';
      // O modelo antigo tinha campos que saíram do novo (Rede, telefone e
      // e-mail dos fornecedores); esses saem em branco.
      await exportarFichaLegada(
        form,
        `Ficha_Cadastro_${nome}_modelo_antigo.xlsx`
      );
    } catch {
      notify('Erro ao gerar a ficha antiga.', { type: 'error' });
    }
    setBusy(false);
  };

  return (
    <Modal
      onClose={fechar}
      ariaLabel="Ficha cadastral de cliente"
      className="w-full md:max-w-2xl rounded-t-2xl md:rounded-xl max-h-[95vh] overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-stone-200">
        <h3 className="font-semibold text-stone-900">
          Ficha Cadastral de Cliente
        </h3>
        <button onClick={fechar} aria-label="Fechar">
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto p-4 flex-1">
        {rascunho && !alterado && (
          <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <RotateCcw
                size={15}
                className="text-amber-700 mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-amber-900">
                  Você tem uma ficha de{' '}
                  <strong>{rotuloRascunho(rascunho.form)}</strong> que ficou
                  pela metade.
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={retomarRascunho}
                    className="px-2.5 py-1 text-xs font-semibold text-white rounded"
                    style={{ backgroundColor: VC_GREEN }}
                  >
                    Continuar de onde parei
                  </button>
                  <button
                    onClick={descartarRascunho}
                    className="px-2.5 py-1 text-xs font-medium text-amber-800 border border-amber-300 rounded"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-stone-500 mb-2">
          Gera o modelo oficial de setembro/2026 (.xlsb), idêntico ao da Verde
          Campo. Pode digitar normalmente: a ficha sai em letra maiúscula e sem
          acento, como o modelo exige.
        </p>

        <Sec>Dados Cadastrais</Sec>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Field
            label="CNPJ"
            value={form.cnpj}
            onChange={(v) => up('cnpj', v)}
          />
          <Field
            label="Inscrição Estadual"
            value={form.ie}
            onChange={(v) => up('ie', v)}
            placeholder="ou ISENTO"
          />
          <Field
            label="Suframa"
            value={form.suframa}
            onChange={(v) => up('suframa', v)}
          />
        </div>
        <div className="grid grid-cols-1 gap-2 mt-2">
          <Field
            label="Razão Social"
            value={form.razaoSocial}
            onChange={(v) => up('razaoSocial', v)}
          />
          <Field
            label="Nome Fantasia"
            value={form.nomeFantasia}
            onChange={(v) => up('nomeFantasia', v)}
          />
          <Field
            label={`Nome Abrev. (${form.nomeAbrev.length}/12)`}
            value={form.nomeAbrev}
            onChange={(v) => up('nomeAbrev', v.slice(0, 12))}
          />
        </div>

        <Sec>Endereço Principal</Sec>
        <EnderecoFields prefix="" form={form} up={up} />
        <button
          onClick={copiarEndereco}
          className="text-xs mt-2 px-2 py-1 rounded border"
          style={{ borderColor: VC_GREEN, color: VC_GREEN }}
        >
          Copiar p/ cobrança e entrega
        </button>

        <Sec>Endereço Cobrança</Sec>
        <EnderecoFields prefix="cob_" form={form} up={up} />

        <Sec>Endereço Entrega</Sec>
        <EnderecoFields prefix="ent_" form={form} up={up} />

        <Sec>Dados de Contato</Sec>
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Financeiro (nome)"
            value={form.fin_nome}
            onChange={(v) => up('fin_nome', v)}
          />
          <Field
            label="Telefone"
            value={form.fin_telefone}
            onChange={(v) => up('fin_telefone', v)}
          />
          <Field
            label="E-mail"
            value={form.fin_email}
            onChange={(v) => up('fin_email', v)}
          />
          <Field
            label="E-mail Nota Fiscal"
            value={form.email_nf}
            onChange={(v) => up('email_nf', v)}
          />
        </div>

        <Sec>Dados Bancários</Sec>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="col-span-2 md:col-span-1">
            <Select
              label={`Banco${codBanco ? ` (cód. ${codBanco})` : ''}`}
              value={form.banco}
              onChange={(v) => up('banco', v)}
              options={BANCOS.map((b) => b.nome)}
            />
          </div>
          <Field
            label="Agência"
            value={form.agencia}
            onChange={(v) => up('agencia', v)}
          />
          <Field
            label="Conta Corrente"
            value={form.conta}
            onChange={(v) => up('conta', v)}
          />
        </div>

        <Sec>Dados Área de Vendas</Sec>
        <div className="grid grid-cols-2 gap-2">
          <Select
            label={`Responsável de Vendas${codRep ? ` (cód. ${codRep})` : ''}`}
            value={form.resp_vendas}
            onChange={(v) => up('resp_vendas', v)}
            options={REPRESENTANTES.map((r) => r.nome)}
          />
          <Select
            label="É Filial?"
            value={form.filial}
            onChange={(v) => up('filial', v)}
            options={['S', 'N']}
          />
          <div className="col-span-2">
            <Combo
              label="Tabela de Preço"
              value={form.tabela_preco}
              onChange={(v) => up('tabela_preco', v)}
              options={TABELAS_PRECO}
              invalido={tabelaInvalida}
            />
          </div>
          <Select
            label="EDI"
            value={form.edi}
            onChange={(v) => up('edi', v)}
            options={OPCOES_EDI}
          />
          <Select
            label="Modalidade de Frete"
            value={form.frete}
            onChange={(v) => up('frete', v)}
            options={MODALIDADES_FRETE}
          />
          <Select
            label="Forma de Pagamento"
            value={form.forma_pagamento}
            onChange={(v) => up('forma_pagamento', v)}
            options={FORMAS_PAGAMENTO}
          />
          <Field
            label="Prazo de Pagamento (dias)"
            value={form.prazo_pagamento}
            onChange={(v) => up('prazo_pagamento', v)}
            placeholder="ex.: 28D"
          />
          <div className="col-span-2">
            <Field
              label="Limite de Crédito Solicitado"
              value={form.limite_credito}
              onChange={(v) => up('limite_credito', v)}
            />
          </div>
        </div>

        <Sec>Referências Comerciais</Sec>
        <div className="grid grid-cols-1 gap-2">
          {[1, 2, 3].map((n) => (
            <Field
              key={n}
              label={`Fornecedor ${n}`}
              value={form[`forn${n}`]}
              onChange={(v) => up(`forn${n}`, v)}
            />
          ))}
        </div>

        <div className="mt-4 text-[11px] text-stone-500 bg-stone-50 border border-stone-200 rounded-lg p-2">
          O bloco de preenchimento interno da Verde Campo e os códigos de banco
          e representante são resolvidos pela própria planilha ao abrir.
        </div>
      </div>

      <div className="p-4 border-t border-stone-200">
        <div className="flex gap-2">
          <button
            onClick={fechar}
            className="px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
          >
            Fechar
          </button>
          <button
            onClick={baixarFichaEmBranco}
            className="px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg border border-stone-300"
          >
            Ficha em branco
          </button>
          <button
            onClick={gerar}
            disabled={busy}
            className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: VC_GREEN }}
          >
            {busy ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {busy ? 'Gerando...' : 'Gerar Ficha'}
          </button>
        </div>
        <details className="mt-2">
          <summary className="text-[11px] text-stone-500 cursor-pointer">
            Precisa do modelo antigo (.xlsx)?
          </summary>
          <div className="flex gap-2 mt-2">
            <button
              onClick={gerarLegada}
              disabled={busy}
              className="px-3 py-1.5 text-xs font-medium text-stone-700 border border-stone-300 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
            >
              <FileDown size={13} />
              Gerar no modelo antigo
            </button>
            <button
              onClick={baixarFichaLegadaEmBranco}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 border border-stone-300 rounded-lg"
            >
              Antigo em branco
            </button>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            O modelo antigo tinha telefone e e-mail dos fornecedores e o campo
            Rede, que saíram do novo — esses vão em branco.
          </p>
        </details>
      </div>
    </Modal>
  );
}

function EnderecoFields({ prefix, form, up }) {
  return (
    <>
      <div className="grid grid-cols-6 gap-2">
        <div className="col-span-4">
          <Field
            label="Logradouro"
            value={form[`${prefix}logradouro`]}
            onChange={(v) => up(`${prefix}logradouro`, v)}
          />
        </div>
        <div className="col-span-1">
          <Field
            label="Nº"
            value={form[`${prefix}numero`]}
            onChange={(v) => up(`${prefix}numero`, v)}
          />
        </div>
        <div className="col-span-1">
          <Field
            label="Compl."
            value={form[`${prefix}complemento`]}
            onChange={(v) => up(`${prefix}complemento`, v)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        <Field
          label="Bairro"
          value={form[`${prefix}bairro`]}
          onChange={(v) => up(`${prefix}bairro`, v)}
        />
        <Field
          label="CEP"
          value={form[`${prefix}cep`]}
          onChange={(v) => up(`${prefix}cep`, v)}
        />
        <Field
          label="Município"
          value={form[`${prefix}municipio`]}
          onChange={(v) => up(`${prefix}municipio`, v)}
        />
        <Field
          label="Estado"
          value={form[`${prefix}estado`]}
          onChange={(v) => up(`${prefix}estado`, v)}
        />
      </div>
      <div className="mt-2">
        <Field
          label="Telefone"
          value={form[`${prefix}telefone`]}
          onChange={(v) => up(`${prefix}telefone`, v)}
        />
      </div>
    </>
  );
}
