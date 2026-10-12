import type { CartItem } from '@/stores/cartStore';
import type { OrderItem, ProductAddon } from '@/types';
import { createId } from './id';

/** Preço total de um item = (preço base + adicionais) * quantidade. */
export function calcLineTotal(
  unitPrice: number,
  addons: ProductAddon[],
  quantity: number
): number {
  const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
  return (unitPrice + addonsTotal) * quantity;
}

/** Soma o subtotal de uma lista de itens do carrinho. */
export function calcSubtotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + calcLineTotal(item.unitPrice, item.selectedAddons, item.quantity),
    0
  );
}

/**
 * Chave de agrupamento: mesmo produto com os MESMOS adicionais
 * deve somar quantidade em vez de criar uma nova linha.
 */
export function cartLineKey(productId: string, addons: ProductAddon[]): string {
  const addonIds = addons.map((a) => a.id).sort().join('-');
  return `${productId}::${addonIds}`;
}

/** Converte itens do carrinho em itens de pedido (snapshot). */
export function toOrderItems(items: CartItem[]): OrderItem[] {
  return items.map((item) => ({
    id: createId('oi'),
    productId: item.productId,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    selectedAddons: item.selectedAddons,
    notes: item.notes,
    lineTotal: calcLineTotal(item.unitPrice, item.selectedAddons, item.quantity),
  }));
}
