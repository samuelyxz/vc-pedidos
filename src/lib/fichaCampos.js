// Mapa de campo do formulário -> célula, isolado de propósito.
//
// Ler uma ficha de volta (fichaImport) precisa só deste mapa. Se ele morasse
// em ficha.js, importá-lo arrastaria junto o modelo .xlsb embutido e o jszip
// para dentro do pacote inicial do app — 74 kB comprimidos que a maioria das
// telas nunca usa.

// Campo do formulário -> célula da ficha. Tudo mora na coluna C; C51 (código do
// banco) e C57 (código do representante) ficam de fora de propósito: são
// fórmulas VLOOKUP que a própria planilha resolve.
export const FICHA_CELLS = {
  cnpj: 'C10',
  ie: 'C11',
  razaoSocial: 'C12',
  nomeFantasia: 'C13',
  nomeAbrev: 'C14',
  suframa: 'C15',

  logradouro: 'C18',
  numero: 'C19',
  bairro: 'C20',
  cep: 'C21',
  municipio: 'C22',
  estado: 'C23',
  complemento: 'C24',
  telefone: 'C25',

  cob_logradouro: 'C27',
  cob_numero: 'C28',
  cob_bairro: 'C29',
  cob_cep: 'C30',
  cob_municipio: 'C31',
  cob_estado: 'C32',
  cob_complemento: 'C33',
  cob_telefone: 'C34',

  ent_logradouro: 'C36',
  ent_numero: 'C37',
  ent_bairro: 'C38',
  ent_cep: 'C39',
  ent_municipio: 'C40',
  ent_estado: 'C41',
  ent_complemento: 'C42',
  ent_telefone: 'C43',

  fin_nome: 'C45',
  fin_email: 'C46',
  email_nf: 'C47',
  fin_telefone: 'C48',

  banco: 'C50',
  agencia: 'C52',
  conta: 'C53',

  resp_vendas: 'C56',
  filial: 'C58',
  tabela_preco: 'C59',
  edi: 'C60',
  frete: 'C61',
  limite_credito: 'C62',
  prazo_pagamento: 'C63',
  forma_pagamento: 'C64',

  forn1: 'C67',
  forn2: 'C68',
  forn3: 'C69',
};

