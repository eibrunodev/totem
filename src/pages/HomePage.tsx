import { useNavigate } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { useCartStore } from '@/stores/cartStore';
import { useSessionStore } from '@/stores/sessionStore';
import { ROUTES } from '@/config/constants';
import './HomePage.css';

/** Tela inicial (atrai o toque). "Toque para começar." */
export function HomePage() {
  const navigate = useNavigate();
  const { company } = useCompany();
  const clearCart = useCartStore((s) => s.clear);
  const resetSession = useSessionStore((s) => s.resetSession);

  const start = () => {
    // Começar um pedido novo sempre parte de um estado limpo.
    clearCart();
    resetSession();
    navigate(ROUTES.menu);
  };

  return (
    <button className="home" onClick={start} aria-label="Começar pedido">
      <div className="home__glow" />
      <div className="home__content">
        <div className="home__logo pop">{company?.logo ?? '🍔'}</div>
        <h1 className="home__brand">{company?.name ?? 'TotemFood'}</h1>
        <p className="home__welcome">Bem-vindo!</p>
        <p className="home__sub">Faça seu pedido de forma rápida e fácil.</p>

        <span className="home__cta btn btn-primary btn-xl">COMEÇAR PEDIDO</span>
        <p className="home__hint">Toque em qualquer lugar para começar</p>
      </div>
    </button>
  );
}
