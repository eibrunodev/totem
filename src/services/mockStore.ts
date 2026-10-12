/**
 * ============================================================
 * mockStore — "banco de dados" em memória + localStorage
 * ------------------------------------------------------------
 * Simula a camada de persistência enquanto não há Supabase.
 * Guarda pedidos e pedidos de cozinha, persiste no localStorage
 * e emite eventos de mudança.
 *
 * O mecanismo de `subscribe` + evento de `storage` do navegador
 * simula o Supabase Realtime: quando o totem cria um pedido em
 * uma aba, a aba da cozinha (/cozinha) é notificada e atualiza
 * a tela — inclusive entre abas/dispositivos diferentes do mesmo
 * navegador. Ao migrar para Supabase, troca-se este arquivo por
 * chamadas reais + canais Realtime, sem alterar as telas.
 * ============================================================
 */
import { STORAGE_KEYS } from '@/config/constants';
import type { KitchenOrder, Order } from '@/types';
import { mockKitchenOrders, mockOrders } from '@/mock/orders';

const CHANGE_EVENT = 'totemfood:datachange';

type Listener = () => void;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage indisponível — segue apenas em memória */
  }
}

class MockStore {
  private orders: Order[];
  private kitchen: KitchenOrder[];
  private listeners = new Set<Listener>();

  constructor() {
    // Semeia com dados mockados na primeira execução.
    this.orders = read<Order[]>(STORAGE_KEYS.orders, mockOrders);
    this.kitchen = read<KitchenOrder[]>(STORAGE_KEYS.kitchen, mockKitchenOrders);

    // Sincroniza entre abas/dispositivos (simula Realtime).
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.orders || e.key === STORAGE_KEYS.kitchen) {
          this.orders = read<Order[]>(STORAGE_KEYS.orders, this.orders);
          this.kitchen = read<KitchenOrder[]>(STORAGE_KEYS.kitchen, this.kitchen);
          this.emit();
        }
      });
      window.addEventListener(CHANGE_EVENT, () => this.emit());
    }
  }

  // ---- Assinatura (simula Supabase Realtime) ----
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    this.listeners.forEach((l) => l());
  }

  private persistAndNotify(): void {
    write(STORAGE_KEYS.orders, this.orders);
    write(STORAGE_KEYS.kitchen, this.kitchen);
    this.emit();
    // Notifica outras abas do mesmo dispositivo.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(CHANGE_EVENT));
    }
  }

  // ---- Pedidos ----
  getOrders(companyId: string): Order[] {
    return this.orders.filter((o) => o.companyId === companyId);
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id);
  }

  addOrder(order: Order): void {
    this.orders = [order, ...this.orders];
    this.persistAndNotify();
  }

  updateOrder(id: string, patch: Partial<Order>): void {
    this.orders = this.orders.map((o) => (o.id === id ? { ...o, ...patch } : o));
    this.persistAndNotify();
  }

  /** Envia o pedido para o painel da cozinha (KDS). */
  pushToKitchen(kitchenOrder: KitchenOrder): void {
    this.kitchen = [kitchenOrder, ...this.kitchen];
    this.persistAndNotify();
  }

  // ---- Cozinha ----
  getKitchenOrders(companyId: string): KitchenOrder[] {
    return this.kitchen
      .filter((k) => k.companyId === companyId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  updateKitchenOrder(id: string, patch: Partial<KitchenOrder>): void {
    this.kitchen = this.kitchen.map((k) => (k.id === id ? { ...k, ...patch } : k));
    this.persistAndNotify();
  }

  /** Utilidade de demonstração: restaura os dados mockados. */
  reset(): void {
    this.orders = mockOrders;
    this.kitchen = mockKitchenOrders;
    this.persistAndNotify();
  }
}

/** Instância única compartilhada por toda a aplicação. */
export const mockStore = new MockStore();
