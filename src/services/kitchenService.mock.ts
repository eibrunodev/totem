import type { IKitchenService } from './types';
import type { KitchenOrder, KitchenStatus } from '@/types';
import { mockStore } from './mockStore';
import { MOCK_LATENCY } from '@/config/constants';
import { delay } from './delay';

/** Carimba o timestamp correto conforme o novo status. */
function timestampFor(status: KitchenStatus): Partial<KitchenOrder> {
  const now = new Date().toISOString();
  switch (status) {
    case 'IN_PROGRESS':
      return { status, acceptedAt: now };
    case 'READY':
      return { status, readyAt: now };
    case 'DONE':
      return { status, doneAt: now };
    default:
      return { status };
  }
}

/**
 * Implementação MOCK de kitchenService.
 * O `subscribe` usa o mockStore (localStorage + eventos) para
 * simular Supabase Realtime. Substituir por um canal Realtime:
 *   supabase.channel('kitchen').on('postgres_changes', ...).
 */
export const mockKitchenService: IKitchenService = {
  async getOrders(companyId: string): Promise<KitchenOrder[]> {
    return delay(mockStore.getKitchenOrders(companyId), MOCK_LATENCY.fast);
  },

  async updateStatus(id: string, status: KitchenStatus): Promise<void> {
    mockStore.updateKitchenOrder(id, timestampFor(status));
  },

  subscribe(companyId: string, cb: (orders: KitchenOrder[]) => void): () => void {
    // Emite o estado atual imediatamente e a cada mudança.
    cb(mockStore.getKitchenOrders(companyId));
    return mockStore.subscribe(() => cb(mockStore.getKitchenOrders(companyId)));
  },
};
