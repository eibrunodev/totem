import { useEffect, useState } from 'react';
import type { KitchenOrder } from '@/types';
import { kitchenService } from '@/services';
import { useCompany } from '@/contexts/CompanyContext';

/**
 * Assina os pedidos da cozinha em tempo real (mock via mockStore;
 * futuramente via Supabase Realtime). Atualiza sozinho quando o
 * totem cria um novo pedido.
 */
export function useKitchenOrders() {
  const { companyId } = useCompany();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = kitchenService.subscribe(companyId, (next) => {
      setOrders(next);
      setLoading(false);
    });
    return unsubscribe;
  }, [companyId]);

  return { orders, loading };
}
