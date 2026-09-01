import { useState } from 'react';
import { Download, X, RefreshCw } from 'lucide-react';
import { VC_GREEN } from '../lib/constants.js';
import { gerarFichaCadastro, baixarFichaEmBranco } from '../lib/ficha.js';
import { useToast } from '../state/ToastContext.jsx';
import { Field } from './Field.jsx';
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

export function FichaCadastralModal({ clienteInicial, onClose }) {
  const { notify } = useToast();
  const seed = clienteInicial || {};
  const [form, setForm] = useState({
    cnpj: seed.cnpj || '',
    ie: seed.ie || '',
    suframa: '',
    razaoSocial: seed.razaoSocial || '',
    nomeFantasia: seed.nomeFantasia || '',
    nomeAbrev: (seed.nomeFantasia || seed.razaoSocial || '').slice(0, 12),
    logradouro: seed.endereco || '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: seed.cidade || '',
    estado: seed.uf || '',
    cep: seed.cep || '',
    telefone: seed.telefone || '',
    // entrega / cobrança começam vazios (usuário copia se quiser)
    ent_logradouro: '',
    ent_numero: '',
    ent_complemento: '',
    ent_bairro: '',
    ent_municipio: '',
    ent_estado: '',
    ent_cep: '',
    ent_telefone: '',
    cob_logradouro: '',
    cob_numero: '',
    cob_complemento: '',
    cob_bairro: '',
    cob_municipio: '',
    cob_estado: '',
    cob_cep: '',
    cob_telefone: '',
    fin_nome: seed.contato || '',
    fin_telefone: '',
    fin_email: seed.email || '',
    email_nf: '',
    banco: '',
    agencia: '',
    conta: '',
    forn1: '',
    forn1_tel: '',
    forn1_email: '',
    forn2: '',
    forn2_tel: '',
    forn2_email: '',
    forn3: '',
    forn3_tel: '',
    forn3_email: '',
    resp_vendas: '',
    cod_resp_vendas: '',
    rede: seed.rede || '',
    edi: '',
    tabela_preco: '',
    limite_credito: '',
    prazo_pagamento: '',
  });
  const [busy, setBusy] = useState(false);

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const copiarEndereco = () => {
    setForm((f) => ({
      ...f,
      ent_logradouro: f.logradouro,
      ent_numero: f.numero,
      ent_complemento: f.complemento,
      ent_bairro: f.bairro,
      ent_municipio: f.municipio,
      ent_estado: f.estado,
      ent_cep: f.cep,
      ent_telefone: f.telefone,
      cob_logradouro: f.logradouro,
      cob_numero: f.numero,
      cob_complemento: f.complemento,
      cob_bairro: f.bairro,
      cob_municipio: f.municipio,
      cob_estado: f.estado,
      cob_cep: f.cep,
      cob_telefone: f.telefone,
    }));
  };

  const gerar = async () => {
    if (!form.razaoSocial.trim()) {
      notify('Preencha ao menos a Razão Social.', { type: 'error' });
      return;
    }
    setBusy(true);
    try {
      const blob = await gerarFichaCadastro(form);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const nome = (form.nomeFantasia || form.razaoSocial)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .slice(0, 30);
      a.href = url;
      a.download = `Ficha_Cadastro_${nome}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      notify('Erro ao gerar a ficha. Tente novamente.', { type: 'error' });
    }
    setBusy(false);
  };


  return (
    <Modal
      onClose={onClose}
      ariaLabel="Ficha cadastral de cliente"
      className="w-full md:max-w-2xl rounded-t-2xl md:rounded-xl max-h-[95vh] overflow-hidden flex flex-col"
    >
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h3 className="font-semibold text-stone-900">
            Ficha Cadastral de Cliente
          </h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          <p className="text-xs text-stone-500 mb-2">
            Preenche os campos e gera a ficha oficial da Verde Campo, idêntica
            ao modelo. Campos em branco ficam vazios na ficha.
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
            />
            <Field
              label="Suframa"
              value={form.suframa}
              onChange={(v) => up('suframa', v)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2 mt-2">
            <Field
              label="Razão Social *"
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

          <div className="flex items-center justify-between mt-3">
            <Sec>Endereço Principal</Sec>
          </div>
          <EnderecoFields prefix="" form={form} up={up} />
          <button
            onClick={copiarEndereco}
            className="text-xs mt-2 px-2 py-1 rounded border"
            style={{ borderColor: VC_GREEN, color: VC_GREEN }}
          >
            Copiar p/ entrega e cobrança
          </button>

          <Sec>Endereço Entrega</Sec>
          <EnderecoFields prefix="ent_" form={form} up={up} />

          <Sec>Endereço Cobrança</Sec>
          <EnderecoFields prefix="cob_" form={form} up={up} />

          <Sec>Dados de Contato</Sec>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
          </div>
          <div className="mt-2">
            <Field
              label="E-mail Nota Fiscal"
              value={form.email_nf}
              onChange={(v) => up('email_nf', v)}
            />
          </div>

          <Sec>Dados Bancários</Sec>
          <div className="grid grid-cols-3 gap-2">
            <Field
              label="Banco"
              value={form.banco}
              onChange={(v) => up('banco', v)}
            />
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

          <Sec>Referências Comerciais</Sec>
          {[1, 2, 3].map((n) => (
            <div key={n} className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
              <Field
                label={`Fornecedor ${n}`}
                value={form[`forn${n}`]}
                onChange={(v) => up(`forn${n}`, v)}
              />
              <Field
                label="Telefone"
                value={form[`forn${n}_tel`]}
                onChange={(v) => up(`forn${n}_tel`, v)}
              />
              <Field
                label="E-mail"
                value={form[`forn${n}_email`]}
                onChange={(v) => up(`forn${n}_email`, v)}
              />
            </div>
          ))}

          <Sec>Dados Área de Vendas</Sec>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Responsável de Vendas"
              value={form.resp_vendas}
              onChange={(v) => up('resp_vendas', v)}
            />
            <Field
              label="Cód. Responsável"
              value={form.cod_resp_vendas}
              onChange={(v) => up('cod_resp_vendas', v)}
            />
            <Field
              label="Rede"
              value={form.rede}
              onChange={(v) => up('rede', v)}
            />
            <Field
              label="Tabela de Preço"
              value={form.tabela_preco}
              onChange={(v) => up('tabela_preco', v)}
            />
            <Field
              label="Limite Crédito Solicitado"
              value={form.limite_credito}
              onChange={(v) => up('limite_credito', v)}
            />
            <Field
              label="Prazo de Pagamento (dias)"
              value={form.prazo_pagamento}
              onChange={(v) => up('prazo_pagamento', v)}
            />
          </div>

          <div className="mt-4 text-[11px] text-stone-500 bg-stone-50 border border-stone-200 rounded-lg p-2">
            Os campos de checkbox (Frete CIF/FOB, Forma de Pagamento) e o bloco
            de "Preenchimento Interno" ficam como no original para a Verde Campo
            preencher.
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-stone-200">
          <button
            onClick={onClose}
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
          label="Município"
          value={form[`${prefix}municipio`]}
          onChange={(v) => up(`${prefix}municipio`, v)}
        />
        <Field
          label="Estado"
          value={form[`${prefix}estado`]}
          onChange={(v) => up(`${prefix}estado`, v)}
        />
        <Field
          label="CEP"
          value={form[`${prefix}cep`]}
          onChange={(v) => up(`${prefix}cep`, v)}
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
