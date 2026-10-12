import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { formatCurrency, formatOrderNumber } from '@/utils/format';
import { ROUTES } from '@/config/constants';

const METHOD_LABEL: Record<string, string> = {
  PIX: 'PIX',
  DEBIT: 'Cartão de Débito',
  CREDIT: 'Cartão de Crédito',
};

/** Tela de sucesso: pedido enviado para a cozinha. */
export function OrderCompletePage() {
  const navigate = useNavigate();
  const order = useSessionStore((s) => s.lastOrder);
  const resetSession = useSessionStore((s) => s.resetSession);

  // Sem pedido (acesso direto/refresh) → volta ao início.
  useEffect(() => {
    if (!order) navigate(ROUTES.home, { replace: true });
  }, [order, navigate]);

  if (!order) return null;

  const newOrder = () => {
    resetSession();
    navigate(ROUTES.home);
  };

  return (
    <div className="done">
      <div className="done__check pop">✓</div>
      <h1 className="h1 done__title">Pedido realizado com sucesso!</h1>
      <p className="done__sub">Seu pedido foi enviado para a cozinha.</p>

      <div className="done__card fade-up">
        <span className="text-muted">Número do pedido</span>
        <span className="done__number">{formatOrderNumber(order.number)}</span>

        <div className="done__row">
          <span>Cliente</span>
          <span>{order.customerName}</span>
        </div>
        <div className="done__row">
          <span>Forma de pagamento</span>
          <span>{order.paymentMethod ? METHOD_LABEL[order.paymentMethod] : '-'}</span>
        </div>
        <div className="done__row">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      <button
        className="btn btn-primary btn-xl"
        style={{ marginTop: '2rem', minWidth: 300 }}
        onClick={newOrder}
      >
        NOVO PEDIDO
      </button>
    </div>
  );
}
