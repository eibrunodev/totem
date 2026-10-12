import type { KitchenOrder, KitchenStatus } from '@/types';
import { formatCurrency, formatOrderNumber, minutesSince } from '@/utils/format';

interface KitchenCardProps {
  order: KitchenOrder;
  onAdvance: (id: string, next: KitchenStatus) => void;
  onRevert?: (id: string, prev: KitchenStatus) => void;
}

const STATUS_META: Record<
  KitchenStatus,
  { label: string; badge: string; next?: KitchenStatus; action?: string; prev?: KitchenStatus }
> = {
  NEW: { label: 'Novo', badge: 'badge-new', next: 'IN_PROGRESS', action: 'Aceitar pedido' },
  IN_PROGRESS: {
    label: 'Em preparo',
    badge: 'badge-progress',
    next: 'READY',
    action: 'Marcar pronto',
    prev: 'NEW',
  },
  READY: {
    label: 'Pronto',
    badge: 'badge-ready',
    next: 'DONE',
    action: 'Finalizar pedido',
    prev: 'IN_PROGRESS',
  },
  DONE: { label: 'Finalizado', badge: 'badge-done' },
};

/** Card de um pedido no painel da cozinha. */
export function KitchenCard({ order, onAdvance, onRevert }: KitchenCardProps) {
  const meta = STATUS_META[order.status];
  const minutes = minutesSince(order.createdAt);
  const isLate = minutes >= 10 && order.status !== 'DONE';

  return (
    <div className={`kds-card kds-card--${order.status.toLowerCase()}`}>
      <div className="kds-card__head">
        <span className="kds-card__number">{formatOrderNumber(order.number)}</span>
        <span className={`badge ${meta.badge}`}>{meta.label}</span>
      </div>

      <div className="kds-card__meta">
        <span className="kds-card__customer">👤 {order.customerName}</span>
        <span className={`kds-card__time ${isLate ? 'is-late' : ''}`}>
          ⏱ {minutes} min
        </span>
      </div>

      <ul className="kds-card__items">
        {order.items.map((item) => (
          <li key={item.id} className="kds-card__item">
            <span className="kds-card__qty">{item.quantity}×</span>
            <span className="kds-card__item-name">
              {item.name}
              {item.selectedAddons.length > 0 && (
                <em className="kds-card__addons">
                  {' '}
                  (+ {item.selectedAddons.map((a) => a.name).join(', ')})
                </em>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="kds-card__footer">
        <span className="kds-card__total">{formatCurrency(order.total)}</span>
        <div className="kds-card__actions">
          {meta.prev && onRevert && (
            <button
              className="btn btn-ghost kds-card__revert"
              onClick={() => onRevert(order.id, meta.prev!)}
            >
              ‹ Voltar
            </button>
          )}
          {meta.next && meta.action && (
            <button
              className="btn btn-primary kds-card__advance"
              onClick={() => onAdvance(order.id, meta.next!)}
            >
              {meta.action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
