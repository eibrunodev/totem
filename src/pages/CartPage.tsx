import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useCompany } from '@/contexts/CompanyContext';
import { TotemHeader } from '@/components/totem/TotemHeader';
import { CartItemRow } from '@/components/totem/CartItemRow';
import { EmptyState } from '@/components/ui/Feedback';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/config/constants';
import './CartPage.css';

/** Carrinho: revisão dos itens antes de avançar. */
export function CartPage() {
  const navigate = useNavigate();
  const { settings } = useCompany();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);

  const feeRate = settings?.serviceFeeRate ?? 0;
  const serviceFee = subtotal * feeRate;
  const total = subtotal + serviceFee;

  if (items.length === 0) {
    return (
      <>
        <TotemHeader title="Seu pedido" onBack={() => navigate(ROUTES.menu)} showCart={false} />
        <EmptyState
          icon="🛒"
          title="Seu carrinho está vazio"
          description="Adicione itens do cardápio para continuar."
          action={
            <button className="btn btn-primary btn-lg" onClick={() => navigate(ROUTES.menu)}>
              Ver cardápio
            </button>
          }
        />
      </>
    );
  }

  return (
    <>
      <TotemHeader title="Seu pedido" onBack={() => navigate(ROUTES.menu)} showCart={false} />

      <div className="screen-body">
        <div className="cart-list">
          {items.map((item) => (
            <CartItemRow
              key={item.key}
              item={item}
              onIncrement={() => increment(item.key)}
              onDecrement={() => decrement(item.key)}
              onRemove={() => removeItem(item.key)}
            />
          ))}
        </div>

        <div className="totals">
          <div className="totals__row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {feeRate > 0 && (
            <div className="totals__row text-muted">
              <span>Taxa de serviço ({Math.round(feeRate * 100)}%)</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
          )}
          <div className="totals__row totals__row--grand">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="screen-footer">
        <button className="btn btn-secondary btn-lg" onClick={() => navigate(ROUTES.menu)}>
          + Adicionar mais itens
        </button>
        <button
          className="btn btn-primary btn-xl"
          onClick={() => navigate(ROUTES.identification)}
        >
          FINALIZAR PEDIDO • {formatCurrency(total)}
        </button>
      </div>
    </>
  );
}
