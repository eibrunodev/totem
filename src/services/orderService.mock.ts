import type { CreateOrderInput, IOrderService } from './types';
import type { KitchenOrder, Order, PaymentMethod } from '@/types';
import { mockStore } from './mockStore';
import { mockSettings } from '@/mock/settings';
import { STORAGE_KEYS, INITIAL_ORDER_NUMBER, MOCK_LATENCY } from '@/config/constants';
import { createId } from '@/utils/id';
import { delay } from './delay';

/** Lê/incrementa o contador de número de pedido no localStorage. */
function readLastNumber(companyId: string): number {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.lastOrderNumber}.${companyId}`);
    if (raw) return Number(raw);
  } catch {
    /* ignore */
  }
  return (mockSettings[companyId]?.nextOrderNumber ?? INITIAL_ORDER_NUMBER) - 1;
}

function saveLastNumber(companyId: string, n: number): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.lastOrderNumber}.${companyId}`, String(n));
  } catch {
    /* ignore */
  }
}

/**
 * Implementação MOCK de orderService.
 * Substituir por SupabaseOrderService (INSERT em `orders` +
 * `order_items`; o número pode vir de uma sequence do Postgres).
 */
export const mockOrderService: IOrderService = {
  nextOrderNumber(companyId: string): number {
    return readLastNumber(companyId) + 1;
  },

  async createOrder(input: CreateOrderInput): Promise<Order> {
    const number = this.nextOrderNumber(input.companyId);
    saveLastNumber(input.companyId, number);

    const now = new Date().toISOString();
    const order: Order = {
      id: createId('order'),
      companyId: input.companyId,
      number,
      customerName: input.customerName || 'Cliente',
      items: input.items,
      subtotal: input.subtotal,
      serviceFee: input.serviceFee,
      total: input.total,
      paymentMethod: null,
      paymentStatus: 'PENDING',
      orderStatus: 'CREATED',
      createdAt: now,
    };

    // O pedido é criado aguardando pagamento; só vai para a cozinha
    // depois que o pagamento for aprovado (ver markPaid).
    mockStore.addOrder(order);
    return delay(order, MOCK_LATENCY.fast);
  },

  async markPaid(orderId: string, method: PaymentMethod): Promise<Order> {
    const existing = mockStore.getOrderById(orderId);
    if (!existing) throw new Error(`Pedido ${orderId} não encontrado`);

    const paid: Partial<Order> = {
      paymentMethod: method,
      paymentStatus: 'APPROVED',
      orderStatus: 'PAID',
    };
    mockStore.updateOrder(orderId, paid);

    // Agora o pedido aparece no KDS da cozinha (simula o envio via
    // backend/Realtime após confirmação do pagamento).
    const kitchenOrder: KitchenOrder = {
      id: createId('ko'),
      companyId: existing.companyId,
      orderId: existing.id,
      number: existing.number,
      customerName: existing.customerName,
      items: existing.items,
      total: existing.total,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    mockStore.pushToKitchen(kitchenOrder);

    return delay({ ...existing, ...paid }, MOCK_LATENCY.fast);
  },

  async getOrders(companyId: string): Promise<Order[]> {
    return delay(mockStore.getOrders(companyId), MOCK_LATENCY.fast);
  },

  async getOrderById(id: string): Promise<Order | null> {
    return delay(mockStore.getOrderById(id) ?? null, MOCK_LATENCY.fast);
  },
};
