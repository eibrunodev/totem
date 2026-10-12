import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/config/constants';

/** Barra fixa inferior com resumo do carrinho e botão de avançar. */
export function CartBar({ label = 'Ver pedido' }: { label?: string }) {
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems());
  const subtotal = useCartStore((s) => s.subtotal());

  if (totalItems === 0) return null;

  return (
    <div className="cart-bar fade-up">
      <div className="cart-bar__info">
        <span className="cart-bar__count">
          {totalItems} {totalItems === 1 ? 'item' : 'itens'}
        </span>
        <span className="cart-bar__total">{formatCurrency(subtotal)}</span>
      </div>
      <button className="btn btn-primary btn-lg" onClick={() => navigate(ROUTES.cart)}>
        {label} ›
      </button>
    </div>
  );
}
