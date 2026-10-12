import { useMemo, useState } from 'react';
import type { Product, ProductAddon } from '@/types';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { formatCurrency } from '@/utils/format';
import { calcLineTotal } from '@/utils/cart';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (quantity: number, addons: ProductAddon[]) => void;
}

/** Modal de detalhe do produto com adicionais e quantidade. */
export function ProductModal({ product, onClose, onConfirm }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedAddons = useMemo(
    () => product.addons.filter((a) => selected[a.id]),
    [product.addons, selected]
  );

  const total = calcLineTotal(product.price, selectedAddons, quantity);

  const toggleAddon = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal__panel pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        <button className="modal__close" onClick={onClose} aria-label="Fechar">
          ×
        </button>

        <div className="modal__hero">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="modal__content">
          <h2 className="h2">{product.name}</h2>
          <p className="text-muted modal__desc">{product.description}</p>
          <p className="modal__price">{formatCurrency(product.price)}</p>

          {product.addons.length > 0 && (
            <div className="addons">
              <h3 className="h3 addons__title">Adicionais</h3>
              <div className="addons__list">
                {product.addons.map((addon) => {
                  const isOn = !!selected[addon.id];
                  return (
                    <button
                      key={addon.id}
                      className={`addon ${isOn ? 'is-on' : ''}`}
                      onClick={() => toggleAddon(addon.id)}
                    >
                      <span className="addon__check">{isOn ? '✓' : '+'}</span>
                      <span className="addon__name">{addon.name}</span>
                      <span className="addon__price">
                        + {formatCurrency(addon.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="modal__footer">
          <QuantityStepper value={quantity} onChange={setQuantity} size="lg" />
          <button
            className="btn btn-primary btn-lg grow"
            onClick={() => onConfirm(quantity, selectedAddons)}
          >
            Adicionar • {formatCurrency(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
