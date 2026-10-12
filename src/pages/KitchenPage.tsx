import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { KitchenOrder, KitchenStatus } from '@/types';
import { useKitchenOrders } from '@/hooks/useKitchenOrders';
import { kitchenService } from '@/services';
import { KitchenCard } from '@/components/kitchen/KitchenCard';
import { Loading, EmptyState } from '@/components/ui/Feedback';
import { ROUTES } from '@/config/constants';
import './KitchenPage.css';

interface Column {
  status: KitchenStatus;
  title: string;
  emptyText: string;
}

const COLUMNS: Column[] = [
  { status: 'NEW', title: 'Novos', emptyText: 'Sem novos pedidos' },
  { status: 'IN_PROGRESS', title: 'Em preparo', emptyText: 'Nada em preparo' },
  { status: 'READY', title: 'Prontos', emptyText: 'Nenhum pronto' },
];

/** Painel da cozinha (KDS) — atualiza em tempo real. */
export function KitchenPage() {
  const { orders, loading } = useKitchenOrders();

  const byStatus = useMemo(() => {
    const map: Record<KitchenStatus, KitchenOrder[]> = {
      NEW: [],
      IN_PROGRESS: [],
      READY: [],
      DONE: [],
    };
    orders.forEach((o) => map[o.status].push(o));
    return map;
  }, [orders]);

  const advance = (id: string, next: KitchenStatus) =>
    kitchenService.updateStatus(id, next);
  const revert = (id: string, prev: KitchenStatus) =>
    kitchenService.updateStatus(id, prev);

  const activeCount = byStatus.NEW.length + byStatus.IN_PROGRESS.length + byStatus.READY.length;

  return (
    <div className="kds">
      <header className="kds__header">
        <div className="kds__brand">
          <span className="kds__logo">👨‍🍳</span>
          <div>
            <h1 className="kds__title">Cozinha — KDS</h1>
            <p className="kds__subtitle">
              {activeCount} {activeCount === 1 ? 'pedido ativo' : 'pedidos ativos'} ·{' '}
              {byStatus.DONE.length} finalizados
            </p>
          </div>
        </div>
        <div className="kds__header-actions">
          <span className="kds__live">
            <span className="kds__live-dot" /> AO VIVO
          </span>
          <Link to={ROUTES.home} className="btn btn-secondary">
            Ir para o Totem
          </Link>
        </div>
      </header>

      {loading ? (
        <Loading label="Conectando à cozinha…" />
      ) : (
        <div className="kds__board">
          {COLUMNS.map((col) => (
            <section key={col.status} className="kds__column">
              <div className="kds__column-head">
                <h2 className="kds__column-title">{col.title}</h2>
                <span className="kds__column-count">{byStatus[col.status].length}</span>
              </div>
              <div className="kds__column-body">
                {byStatus[col.status].length === 0 ? (
                  <div className="kds__empty">{col.emptyText}</div>
                ) : (
                  byStatus[col.status].map((order) => (
                    <KitchenCard
                      key={order.id}
                      order={order}
                      onAdvance={advance}
                      onRevert={revert}
                    />
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {!loading && activeCount === 0 && byStatus.DONE.length === 0 && (
        <EmptyState
          icon="🍳"
          title="Nenhum pedido ainda"
          description="Os pedidos feitos no totem aparecem aqui automaticamente."
        />
      )}
    </div>
  );
}
