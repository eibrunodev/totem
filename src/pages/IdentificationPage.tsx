import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { useCartStore } from '@/stores/cartStore';
import { TotemHeader } from '@/components/totem/TotemHeader';
import { ROUTES } from '@/config/constants';
import './IdentificationPage.css';

/** Etapa opcional: como podemos chamar você? */
export function IdentificationPage() {
  const navigate = useNavigate();
  const storedName = useSessionStore((s) => s.customerName);
  const setCustomerName = useSessionStore((s) => s.setCustomerName);
  const totalItems = useCartStore((s) => s.totalItems());
  const [name, setName] = useState(storedName);

  // Proteção: sem itens não faz sentido identificar.
  if (totalItems === 0) {
    navigate(ROUTES.menu, { replace: true });
    return null;
  }

  const submit = (finalName: string) => {
    setCustomerName(finalName.trim());
    navigate(ROUTES.summary);
  };

  return (
    <>
      <TotemHeader title="Identificação" onBack={() => navigate(ROUTES.cart)} showCart={false} />

      <div className="ident">
        <div className="ident__content">
          <div className="ident__emoji">👋</div>
          <h1 className="h1 ident__title">Como podemos chamar você?</h1>
          <p className="text-muted ident__hint">
            Usaremos seu nome para chamar o pedido. É opcional.
          </p>

          <input
            className="ident__input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
            maxLength={30}
            autoFocus
            enterKeyHint="done"
            onKeyDown={(e) => e.key === 'Enter' && submit(name)}
          />
        </div>

        <div className="screen-footer">
          <button className="btn btn-ghost btn-lg" onClick={() => submit('')}>
            Pular esta etapa
          </button>
          <button
            className="btn btn-primary btn-xl"
            onClick={() => submit(name)}
            disabled={!name.trim()}
          >
            CONTINUAR
          </button>
        </div>
      </div>
    </>
  );
}
