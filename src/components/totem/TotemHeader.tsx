import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { useCompany } from '@/contexts/CompanyContext';
import { ROUTES } from '@/config/constants';

interface TotemHeaderProps {
  title?: string;
  onBack?: () => void;
  /** Mostra o atalho do carrinho (padrão: true). */
  showCart?: boolean;
}

/** Cabeçalho reutilizável das telas do totem. */
export function TotemHeader({ title, onBack, showCart = true }: TotemHeaderProps) {
  const navigate = useNavigate();
  const { company } = useCompany();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="t-header">
      <div className="t-header__left">
        {onBack ? (
          <button className="t-header__back" onClick={onBack} aria-label="Voltar">
            ‹
          </button>
        ) : (
          <span className="t-header__logo">
            <span className="t-header__logo-mark">{company?.logo ?? '🍔'}</span>
            {company?.name ?? 'TotemFood'}
          </span>
        )}
      </div>

      {title && <h1 className="t-header__title">{title}</h1>}

      <div className="t-header__right">
        {showCart && (
          <button
            className="t-header__cart"
            onClick={() => navigate(ROUTES.cart)}
            aria-label="Ver carrinho"
          >
            🛒
            {totalItems > 0 && <span className="t-header__cart-badge">{totalItems}</span>}
          </button>
        )}
      </div>
    </header>
  );
}
