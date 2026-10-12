/**
 * ============================================================
 * TotemFood — Modelos de domínio (types)
 * ------------------------------------------------------------
 * Estas interfaces representam as entidades que futuramente
 * virão do Supabase. Elas são a "fonte da verdade" do formato
 * dos dados: tanto o MockService quanto o SupabaseService
 * devem retornar objetos que respeitem estes contratos.
 *
 * Convenções:
 *  - Todos os registros pertencem a uma empresa (companyId) →
 *    base do isolamento multiempresa (SaaS / RLS).
 *  - Datas são armazenadas como ISO string (compatível com
 *    o tipo timestamptz do Postgres/Supabase).
 * ============================================================
 */

/** Identificador de empresa — chave do isolamento multiempresa. */
export type CompanyId = string;

/** Papéis de usuário previstos para o futuro (Supabase Auth + RLS). */
export type UserRole = 'ADMIN' | 'MANAGER' | 'KITCHEN' | 'CASHIER' | 'TOTEM';

/** Formas de pagamento suportadas. */
export type PaymentMethod = 'PIX' | 'DEBIT' | 'CREDIT';

/** Situação do pagamento. */
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'APPROVED' | 'DECLINED';

/** Situação do pedido (ciclo de vida geral). */
export type OrderStatus =
  | 'CREATED' // pedido criado, aguardando pagamento
  | 'PAID' // pagamento aprovado, enviado para a cozinha
  | 'CANCELED';

/** Situação do pedido na cozinha (KDS). */
export type KitchenStatus = 'NEW' | 'IN_PROGRESS' | 'READY' | 'DONE';

// ------------------------------------------------------------
// Entidades
// ------------------------------------------------------------

export interface Company {
  id: CompanyId;
  name: string;
  slug: string;
  logo: string;
  /** Cor primária da marca (usada para white-label futuro). */
  primaryColor: string;
  currency: string; // ex.: "BRL"
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  companyId: CompanyId;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  companyId: CompanyId;
  name: string;
  icon: string; // emoji/ícone para exibição rápida no cardápio
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAddon {
  id: string;
  companyId: CompanyId;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  companyId: CompanyId;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  /** Adicionais opcionais que o cliente pode selecionar. */
  addons: ProductAddon[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Item dentro de um pedido. Guarda um snapshot do nome/preço
 * para que o histórico não mude caso o produto seja editado
 * depois (prática comum em sistemas de PDV/faturamento).
 */
export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedAddons: ProductAddon[];
  notes?: string;
  /** unitPrice * quantity + adicionais. */
  lineTotal: number;
}

export interface Payment {
  id: string;
  companyId: CompanyId;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  /** Referência externa (NSU/TID da maquininha ou txid do PIX). */
  externalRef?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  companyId: CompanyId;
  /** Número sequencial exibido ao cliente (ex.: 1024). */
  number: number;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
}

/**
 * Representação do pedido na cozinha (KDS). Em produção pode ser
 * uma "view"/projeção do pedido, ou um registro próprio atualizado
 * via Supabase Realtime.
 */
export interface KitchenOrder {
  id: string;
  companyId: CompanyId;
  orderId: string;
  number: number;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: KitchenStatus;
  createdAt: string;
  acceptedAt?: string;
  readyAt?: string;
  doneAt?: string;
}

export interface Printer {
  id: string;
  companyId: CompanyId;
  name: string;
  /** Ex.: "kitchen", "cashier". */
  target: string;
  /** IP/porta ou identificador do dispositivo (uso futuro). */
  connection: string;
  active: boolean;
}

export interface Settings {
  companyId: CompanyId;
  /** Taxa de serviço em fração (ex.: 0.1 = 10%). 0 = sem taxa. */
  serviceFeeRate: number;
  /** Próximo número de pedido a ser gerado. */
  nextOrderNumber: number;
  /** Habilita etapa de identificação do cliente. */
  askCustomerName: boolean;
  /** Métodos de pagamento habilitados. */
  enabledPaymentMethods: PaymentMethod[];
}
