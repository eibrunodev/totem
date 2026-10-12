import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useCompany } from '@/contexts/CompanyContext';
import { TotemHeader } from '@/components/totem/TotemHeader';
import { formatCurrency } from '@/utils/format';
import { calcLineTotal } from '@/utils/cart';
import { ROUTES } from '@/config/constants';

/** Resumo do pedido — confirmação antes do pagamento. */
export function SummaryPage() {
  const navigate = useNavigate();
  const { settings } = useCompany();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const customerName = useSessionStore((s) => s.customerName);

  if (items.length === 0) {
    navigate(ROUTES.menu, { replace: true });
    return null;
  }

  const feeRate = settings?.serviceFeeRate ?? 0;
  const serviceFee = subtotal * feeRate;
  const total = subtotal + serviceFee;

  return (
    <>
      <TotemHeader
        title="Resumo"
        onBack={() => navigate(ROUTES.identification)}
        showCart={false}
      />

      <div className="screen-body">
        <h2 className="h2" style={{ marginBottom: '0.25rem' }}>
          Seu pedido
        </h2>
        {customerName && (
          <p className="text-muted" style={{ marginBottom: '1rem' }}>
            Cliente: <strong>{customerName}</strong>
          </p>
        )}

        <div className="summary-list">
          {items.map((item) => (
            <div className="summary-row" key={item.key}>
              <span className="summary-row__qty">{item.quantity}×</span>
              <div className="summary-row__main">
                <span className="summary-row__name">{item.name}</span>
                {item.selectedAddons.length > 0 && (
                  <span className="summary-row__addons">
                    + {item.selectedAddons.map((a) => a.name).join(', ')}
                  </span>
                )}
              </div>
              <span className="summary-row__price">
                {formatCurrency(
                  calcLineTotal(item.unitPrice, item.selectedAddons, item.quantity)
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="totals">
          <div className="totals__row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {feeRate > 0 && (
            <div className="totals__row text-muted">
              <span>Taxa de serviço</span>
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
        <button className="btn btn-secondary btn-lg" onClick={() => navigate(ROUTES.cart)}>
          Editar pedido
        </button>
        <button
          className="btn btn-primary btn-xl"
          onClick={() => navigate(ROUTES.payment)}
        >
          CONFIRMAR E PAGAR
        </button>
      </div>
    </>
  );
}
