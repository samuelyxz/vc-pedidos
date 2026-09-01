// Tipos do modelo de dados (JSDoc). Só documentação — não gera código.
// Use com: /** @type {import('../types.js').Pedido} */

/**
 * @typedef {Object} Product
 * @property {string} codigo         Código TOTVS
 * @property {string} [sap]
 * @property {string} [ean]
 * @property {string} [categoria]
 * @property {string} [subcategoria]
 * @property {string} [linha]
 * @property {string} [secao]
 * @property {string} [status]       '', 'LANÇAMENTO', 'NOVO', 'DESCONTINUADO'
 * @property {string} nome
 * @property {string} [descricao_original]
 * @property {number} un_cx          Unidades por caixa
 * @property {number} preco_st       R$/caixa (ou R$/kg quando unidade==='KG')
 * @property {'CX'|'KG'} [unidade]
 * @property {number} [peso_kg]      Peso da caixa em kg (produtos por KG)
 * @property {string} [imagem]       URL da foto
 */

/**
 * @typedef {Object} Cliente
 * @property {string} id
 * @property {string} razaoSocial
 * @property {string} [nomeFantasia]
 * @property {string} [codCliente]
 * @property {string} [rede]
 * @property {string} [cnpj]
 * @property {string} [ie]
 * @property {string} [telefone]
 * @property {string} [email]
 * @property {string} [endereco]
 * @property {string} [cidade]
 * @property {string} [uf]
 * @property {string} [cep]
 * @property {string} [contato]
 */

/**
 * @typedef {Object} Vendedor
 * @property {string} nome
 * @property {string} telefone
 * @property {string} email
 */

/**
 * @typedef {Object} PedidoItem
 * @property {string} codigo
 * @property {number|string} caixas
 * @property {number|string} [bonif]
 * @property {number|string} [descPct]
 * @property {boolean} [isExtra]
 * @property {string} [obs]
 */

/**
 * @typedef {Object} Pedido
 * @property {string} id
 * @property {string} numero
 * @property {string} data            ISO yyyy-mm-dd
 * @property {string|null} clienteId
 * @property {Cliente|null} [clienteSnapshot]
 * @property {PedidoItem[]} items
 * @property {string} obs
 * @property {number} [total]
 * @property {string} [finalizadoEm]
 */

/**
 * @typedef {Object} BonifItem
 * @property {string} codigo
 * @property {number|string} qtd
 */

/**
 * @typedef {Object} Bonificacao
 * @property {string|null} id
 * @property {string} data
 * @property {string|null} clienteId
 * @property {Cliente|null} [clienteSnapshot]
 * @property {string} numeroPedido
 * @property {string} valorPedido
 * @property {string} mediaRSL
 * @property {string} motivo
 * @property {BonifItem[]} items
 * @property {string} [criadoEm]
 */

/**
 * @typedef {Object} CatalogMeta
 * @property {'default'|'upload'} source
 * @property {string|null} updatedAt
 * @property {string} filename
 */

export {};
