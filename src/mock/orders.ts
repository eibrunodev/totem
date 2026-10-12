import type { KitchenOrder, Order, OrderItem } from '@/types';

const COMPANY = 'company-001';

/** Helper compacto para montar itens de pedido mockados. */
function item(
  productId: string,
  name: string,
  unitPrice: number,
  quantity: number
): OrderItem {
  return {
    id: `oi-${productId}-${quantity}`,
    productId,
    name,
    unitPrice,
    quantity,
    selectedAddons: [],
    lineTotal: unitPrice * quantity,
  };
}

const baseTime = Date.now();
const minutesAgo = (m: number) => new Date(baseTime - m * 60000).toISOString();

/**
 * Pedidos mockados já finalizados/pagos — servem de histórico e
 * demonstram diferentes formas de pagamento e status.
 */
export const mockOrders: Order[] = [
  {
    id: 'order-1021',
    companyId: COMPANY,
    number: 1021,
    customerName: 'João',
    items: [
      item('prod-bacon', 'Bacon Burger', 29.9, 1),
      item('prod-fries', 'Batata Frita', 12.0, 1),
      item('prod-coca', 'Coca-Cola', 6.0, 1),
    ],
    subtotal: 47.9,
    serviceFee: 0,
    total: 47.9,
    paymentMethod: 'PIX',
    paymentStatus: 'APPROVED',
    orderStatus: 'PAID',
    createdAt: minutesAgo(12),
  },
  {
    id: 'order-1022',
    companyId: COMPANY,
    number: 1022,
    customerName: 'Maria',
    items: [
      item('prod-combo-classic', 'Combo Classic', 39.9, 1),
      item('prod-milkshake', 'Milkshake', 17.0, 1),
    ],
    subtotal: 56.9,
    serviceFee: 0,
    total: 56.9,
    paymentMethod: 'CREDIT',
    paymentStatus: 'APPROVED',
    orderStatus: 'PAID',
    createdAt: minutesAgo(8),
  },
  {
    id: 'order-1023',
    companyId: COMPANY,
    number: 1023,
    customerName: 'Carlos',
    items: [
      item('prod-duplo', 'Duplo Especial', 36.9, 2),
      item('prod-nuggets', 'Nuggets', 16.0, 1),
      item('prod-guarana', 'Guaraná', 5.5, 2),
    ],
    subtotal: 100.8,
    serviceFee: 0,
    total: 100.8,
    paymentMethod: 'DEBIT',
    paymentStatus: 'APPROVED',
    orderStatus: 'PAID',
    createdAt: minutesAgo(3),
  },
];

/**
 * Pedidos que aparecem no KDS (cozinha) em diferentes estados,
 * demonstrando o painel funcionando desde o primeiro acesso.
 */
export const mockKitchenOrders: KitchenOrder[] = [
  {
    id: 'ko-1021',
    companyId: COMPANY,
    orderId: 'order-1021',
    number: 1021,
    customerName: 'João',
    items: mockOrders[0].items,
    total: 47.9,
    status: 'NEW',
    createdAt: minutesAgo(12),
  },
  {
    id: 'ko-1022',
    companyId: COMPANY,
    orderId: 'order-1022',
    number: 1022,
    customerName: 'Maria',
    items: mockOrders[1].items,
    total: 56.9,
    status: 'IN_PROGRESS',
    createdAt: minutesAgo(8),
    acceptedAt: minutesAgo(6),
  },
  {
    id: 'ko-1023',
    companyId: COMPANY,
    orderId: 'order-1023',
    number: 1023,
    customerName: 'Carlos',
    items: mockOrders[2].items,
    total: 100.8,
    status: 'READY',
    createdAt: minutesAgo(3),
    acceptedAt: minutesAgo(2),
    readyAt: minutesAgo(1),
  },
];
