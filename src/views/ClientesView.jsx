import { useState } from 'react';
import {
  Users,
  Plus,
  X,
  FileText,
} from 'lucide-react';
import { VC_GREEN } from '../lib/constants.js';
import { uid } from '../lib/format.js';
import { useToast } from '../state/ToastContext.jsx';
import { Field } from '../components/Field.jsx';
import { FichaCadastralModal } from '../components/FichaCadastralModal.jsx';
import { Modal } from '../components/Modal.jsx';

// ============== CLIENTES ==============
export function ClientesView({ clientes, setClientes }) {
  const { confirm } = useToast();
  const [editing, setEditing] = useState(null);

  return (
    <div className="px-4 md:px-6 py-4 md:py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-stone-900 hidden md:block">
          Clientes
        </h2>
        <button
          onClick={() => setEditing({})}
          className="ml-auto inline-flex items-center gap-1.5 text-white text-sm font-medium px-3 py-2 rounded-lg"
          style={{ backgroundColor: VC_GREEN }}
        >
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <Users size={36} className="mx-auto text-stone-300 mb-2" />
          <p className="text-sm text-stone-500">Nenhum cliente cadastrado.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-2">
          {clientes.map((c) => (
            <button
              key={c.id}
              onClick={() => setEditing(c)}
              className="bg-white rounded-xl border border-stone-200 p-3 text-left hover:border-stone-300 transition-colors"
            >
              <div className="font-medium text-stone-900 text-sm truncate">
                {c.razaoSocial}
              </div>
              <div className="text-xs text-stone-500 mt-1 space-y-0.5">
                {c.cnpj && <div>CNPJ: {c.cnpj}</div>}
                {c.cidade && (
                  <div>
                    {c.cidade}
                    {c.uf ? `/${c.uf}` : ''}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <ClienteFormModal
          cliente={editing}
          onSave={(c) => {
            if (c.id) {
              setClientes(clientes.map((x) => (x.id === c.id ? c : x)));
            } else {
              setClientes([...clientes, { ...c, id: uid() }]);
            }
            setEditing(null);
          }}
          onDelete={async () => {
            if (
              await confirm('Excluir este cliente?', {
                confirmText: 'Excluir',
                danger: true,
              })
            ) {
              setClientes(clientes.filter((x) => x.id !== editing.id));
              setEditing(null);
            }
          }}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ClienteFormModal({ cliente, onSave, onDelete, onCancel }) {
  const [form, setForm] = useState({
    id: cliente.id,
    razaoSocial: cliente.razaoSocial || '',
    nomeFantasia: cliente.nomeFantasia || '',
    codCliente: cliente.codCliente || '',
    rede: cliente.rede || '',
    cnpj: cliente.cnpj || '',
    ie: cliente.ie || '',
    telefone: cliente.telefone || '',
    email: cliente.email || '',
    endereco: cliente.endereco || '',
    cidade: cliente.cidade || '',
    uf: cliente.uf || '',
    cep: cliente.cep || '',
    contato: cliente.contato || '',
  });

  const update = (k, v) => setForm({ ...form, [k]: v });
  const [showFicha, setShowFicha] = useState(false);

  return (
    <>
      <Modal
        onClose={onCancel}
        ariaLabel={cliente.id ? 'Editar cliente' : 'Novo cliente'}
        className="w-full md:max-w-lg rounded-t-2xl md:rounded-xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h3 className="font-semibold text-stone-900">
            {cliente.id ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 flex-1 space-y-3">
          <Field
            label="Razão Social *"
            value={form.razaoSocial}
            onChange={(v) => update('razaoSocial', v)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Nome Fantasia"
              value={form.nomeFantasia}
              onChange={(v) => update('nomeFantasia', v)}
              placeholder="Nome que aparece na loja"
            />
            <Field
              label="Cód. Cliente (TOTVS)"
              value={form.codCliente}
              onChange={(v) => update('codCliente', v)}
              placeholder="Código no sistema VC"
            />
          </div>
          <Field
            label="Rede"
            value={form.rede}
            onChange={(v) => update('rede', v)}
            placeholder="Rede/grupo (se houver)"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="CNPJ"
              value={form.cnpj}
              onChange={(v) => update('cnpj', v)}
              placeholder="00.000.000/0000-00"
            />
            <Field
              label="IE"
              value={form.ie}
              onChange={(v) => update('ie', v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Telefone"
              value={form.telefone}
              onChange={(v) => update('telefone', v)}
            />
            <Field
              label="E-mail"
              value={form.email}
              onChange={(v) => update('email', v)}
              type="email"
            />
          </div>
          <Field
            label="Contato (pessoa)"
            value={form.contato}
            onChange={(v) => update('contato', v)}
            placeholder="Nome do comprador"
          />
          <Field
            label="Endereço"
            value={form.endereco}
            onChange={(v) => update('endereco', v)}
          />
          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Cidade"
              value={form.cidade}
              onChange={(v) => update('cidade', v)}
            />
            <Field
              label="UF"
              value={form.uf}
              onChange={(v) => update('uf', v.toUpperCase().slice(0, 2))}
            />
            <Field
              label="CEP"
              value={form.cep}
              onChange={(v) => update('cep', v)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 p-4 border-t border-stone-200">
          {cliente.id && (
            <button
              onClick={onDelete}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
            >
              Excluir
            </button>
          )}
          <button
            onClick={() => setShowFicha(true)}
            className="px-3 py-2 text-sm font-medium rounded-lg border inline-flex items-center gap-1.5"
            style={{ borderColor: VC_GREEN, color: VC_GREEN }}
          >
            <FileText size={14} /> Ficha Cadastral
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={() => form.razaoSocial.trim() && onSave(form)}
            disabled={!form.razaoSocial.trim()}
            className="flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
            style={{ backgroundColor: VC_GREEN }}
          >
            Salvar
          </button>
        </div>
      </Modal>
      {showFicha && (
        <FichaCadastralModal
          clienteInicial={form}
          onClose={() => setShowFicha(false)}
        />
      )}
    </>
  );
}
