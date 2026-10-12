import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ProductAddon } from '@/types';
import { useProduct } from '@/hooks/useCatalog';
import { useCartStore } from '@/stores/cartStore';
import { TotemHeader } from '@/components/totem/TotemHeader';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Loading, EmptyState } from '@/components/ui/Feedback';
import { formatCurrency } from '@/utils/format';
import { calcLineTotal } from '@/utils/cart';
import { ROUTES } from '@/config/constants';

/**
 * Página de produto acessível pela rota /produto/:id.
 * (No fluxo padrão o cardápio usa um modal; esta rota existe para
 * deep-link e futura navegação direta.)
 */
export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, loading } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);

  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedAddons = useMemo(
    () => product?.addons.filter((a) => selected[a.id]) ?? [],
    [product, selected]
  );

  if (loading) {
    return (
      <>
        <TotemHeader onBack={() => navigate(ROUTES.menu)} />
        <Loading />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <TotemHeader onBack={() => navigate(ROUTES.menu)} />
        <EmptyState
          title="Produto não encontrado"
          action={
            <button className="btn btn-primary" onClick={() => navigate(ROUTES.menu)}>
              Voltar ao cardápio
            </button>
          }
        />
      </>
    );
  }

  const total = calcLineTotal(product.price, selectedAddons, quantity);

  const add = () => {
    addItem(product, quantity, selectedAddons);
    navigate(ROUTES.menu);
  };

  return (
    <>
      <TotemHeader onBack={() => navigate(ROUTES.menu)} />
      <div className="modal__hero" style={{ aspectRatio: '16/9' }}>
        <img src={product.image} alt={product.name} />
      </div>
      <div className="screen-body">
        <h1 className="h2">{product.name}</h1>
        <p className="text-muted" style={{ margin: '0.5rem 0 0.8rem' }}>
          {product.description}
        </p>
        <p className="modal__price">{formatCurrency(product.price)}</p>

        {product.addons.length > 0 && (
          <div className="addons">
            <h3 className="h3 addons__title">Adicionais</h3>
            <div className="addons__list">
              {product.addons.map((addon: ProductAddon) => {
                const isOn = !!selected[addon.id];
                return (
                  <button
                    key={addon.id}
                    className={`addon ${isOn ? 'is-on' : ''}`}
                    onClick={() =>
                      setSelected((p) => ({ ...p, [addon.id]: !p[addon.id] }))
                    }
                  >
                    <span className="addon__check">{isOn ? '✓' : '+'}</span>
                    <span className="addon__name">{addon.name}</span>
                    <span className="addon__price">+ {formatCurrency(addon.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="screen-footer" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <QuantityStepper value={quantity} onChange={setQuantity} size="lg" />
        <button className="btn btn-primary btn-lg grow" onClick={add}>
          Adicionar • {formatCurrency(total)}
        </button>
      </div>
    </>
  );
}
