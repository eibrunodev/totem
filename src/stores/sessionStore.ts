/**
 * Store da "sessão de pedido" atual: nome do cliente, forma de
 * pagamento escolhida, último pedido finalizado e o modo totem.
 * Persistido para sobreviver a refresh acidental durante o pedido.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, PaymentMethod } from '@/types';
import { STORAGE_KEYS } from '@/config/constants';

interface SessionState {
  customerName: string;
  paymentMethod: PaymentMethod | null;
  /** Último pedido concluído — exibido na tela de sucesso. */
  lastOrder: Order | null;
  /** Modo totem (tela cheia, sem menus administrativos). */
  totemMode: boolean;

  setCustomerName: (name: string) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setLastOrder: (order: Order | null) => void;
  setTotemMode: (on: boolean) => void;
  /** Zera a sessão para iniciar um novo pedido. */
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      customerName: '',
      paymentMethod: null,
      lastOrder: null,
      totemMode: false,

      setCustomerName: (customerName) => set({ customerName }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setLastOrder: (lastOrder) => set({ lastOrder }),
      setTotemMode: (totemMode) => set({ totemMode }),

      resetSession: () =>
        set({ customerName: '', paymentMethod: null, lastOrder: null }),
    }),
    {
      name: STORAGE_KEYS.session,
      // Não persistimos o modo totem entre reinícios propositalmente:
      partialize: (s) => ({
        customerName: s.customerName,
        paymentMethod: s.paymentMethod,
        lastOrder: s.lastOrder,
        totemMode: s.totemMode,
      }),
    }
  )
);
