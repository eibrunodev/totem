/**
 * Store do carrinho (Zustand + persistência em localStorage).
 *
 * Mantém apenas o estado do carrinho e as ações para manipulá-lo.
 * A lógica de cálculo fica em `utils/cart.ts` (fora da UI e do
 * store), respeitando a separação de responsabilidades.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductAddon } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';
import { calcLineTotal, calcSubtotal, cartLineKey } from '@/utils/cart';

export interface CartItem {
  /** Chave única = produto + adicionais selecionados. */
  key: string;
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selectedAddons: ProductAddon[];
  notes?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity: number,
    selectedAddons: ProductAddon[],
    notes?: string
  ) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  // Seletores derivados
  totalItems: () => number;
  subtotal: () => number;
  lineTotal: (item: CartItem) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity, selectedAddons, notes) => {
        const key = cartLineKey(product.id, selectedAddons);
        const existing = get().items.find((i) => i.key === key);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
          return;
        }

        const newItem: CartItem = {
          key,
          productId: product.id,
          name: product.name,
          image: product.image,
          unitPrice: product.price,
          quantity,
          selectedAddons,
          notes,
        };
        set({ items: [...get().items, newItem] });
      },

      increment: (key) =>
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }),

      decrement: (key) =>
        set({
          items: get()
            .items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity - 1 } : i
            )
            .filter((i) => i.quantity > 0),
        }),

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => calcSubtotal(get().items),

      lineTotal: (item) =>
        calcLineTotal(item.unitPrice, item.selectedAddons, item.quantity),
    }),
    { name: STORAGE_KEYS.cart }
  )
);
