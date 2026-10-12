/**
 * Contratos (interfaces) da camada de serviços.
 *
 * A UI depende SOMENTE destas interfaces — nunca dos dados
 * mockados diretamente. Assim, para plugar o Supabase, basta
 * criar implementações que respeitem estes contratos e trocar
 * a fábrica em `services/index.ts`.
 */
import type {
  Category,
  Company,
  KitchenOrder,
  KitchenStatus,
  Order,
  Payment,
  PaymentMethod,
  Product,
  Settings,
} from '@/types';

export interface ICompanyService {
  getCompany(companyId: string): Promise<Company | null>;
  getSettings(companyId: string): Promise<Settings>;
}

export interface IProductService {
  getCategories(companyId: string): Promise<Category[]>;
  getProducts(companyId: string): Promise<Product[]>;
  getProductById(companyId: string, id: string): Promise<Product | null>;
}

/** Dados necessários para criar um pedido a partir do carrinho. */
export interface CreateOrderInput {
  companyId: string;
  customerName: string;
  items: Order['items'];
  subtotal: number;
  serviceFee: number;
  total: number;
}

export interface IOrderService {
  /** Cria o pedido (status CREATED, aguardando pagamento). */
  createOrder(input: CreateOrderInput): Promise<Order>;
  /**
   * Confirma o pagamento aprovado: marca o pedido como PAID e o
   * envia para a cozinha (KDS). Retorna o pedido atualizado.
   */
  markPaid(orderId: string, method: PaymentMethod): Promise<Order>;
  getOrders(companyId: string): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  /** Gera o próximo número sequencial de pedido (mock). */
  nextOrderNumber(companyId: string): number;
}

/** Resultado de uma tentativa de pagamento. */
export interface PaymentResult {
  payment: Payment;
  approved: boolean;
}

export interface IPaymentService {
  /** Processa o pagamento (simulado). */
  process(params: {
    companyId: string;
    orderId: string;
    method: PaymentMethod;
    amount: number;
  }): Promise<PaymentResult>;
}

export interface IKitchenService {
  getOrders(companyId: string): Promise<KitchenOrder[]>;
  updateStatus(id: string, status: KitchenStatus): Promise<void>;
  /** Assina mudanças em tempo real (simula Supabase Realtime). */
  subscribe(companyId: string, cb: (orders: KitchenOrder[]) => void): () => void;
}

export interface IPrinterService {
  /** Envia o pedido para impressão (simulado por enquanto). */
  printOrder(order: Order): Promise<void>;
}
