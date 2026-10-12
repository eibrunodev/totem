/** Constantes de aplicação — evita "valores mágicos" espalhados. */

/** Chaves usadas no localStorage (persistência temporária). */
export const STORAGE_KEYS = {
  cart: 'totemfood.cart',
  session: 'totemfood.session',
  orders: 'totemfood.orders',
  kitchen: 'totemfood.kitchen',
  lastOrderNumber: 'totemfood.lastOrderNumber',
  settings: 'totemfood.settings',
  catalogCategories: 'totemfood.catalog.categories',
  catalogProducts: 'totemfood.catalog.products',
  currentCompany: 'totemfood.currentCompany',
} as const;

/** Rotas da aplicação centralizadas. */
export const ROUTES = {
  home: '/',
  menu: '/cardapio',
  product: '/produto/:id',
  cart: '/carrinho',
  identification: '/identificacao',
  summary: '/resumo',
  payment: '/pagamento',
  orderComplete: '/pedido-finalizado',
  kitchen: '/cozinha',
  admin: '/admin',
  adminMenu: '/admin/cardapio',
} as const;

/** Helper para gerar caminho de produto. */
export const productPath = (id: string) => `/produto/${id}`;

/** Latência simulada (ms) para dar sensação de carregamento real. */
export const MOCK_LATENCY = {
  fast: 250,
  normal: 500,
  payment: 2200,
} as const;

/** Número inicial de pedido quando não há histórico. */
export const INITIAL_ORDER_NUMBER = 1024;