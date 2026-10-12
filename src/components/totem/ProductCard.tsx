import type { Product } from '@/types';
import { formatCurrency } from '@/utils/format';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

/** Card de produto do cardápio. */
export function ProductCard({ product, onSelect }: ProductCardProps) {
  const disabled = !product.available;

  return (
    <button
      className={`product-card ${disabled ? 'is-disabled' : ''}`}
      onClick={() => !disabled && onSelect(product)}
      disabled={disabled}
    >
      <div className="product-card__image">
        <img src={product.image} alt={product.name} loading="lazy" />
        {disabled && <span className="product-card__badge">Indisponível</span>}
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">{formatCurrency(product.price)}</span>
          {!disabled && <span className="product-card__add">+</span>}
        </div>
      </div>
    </button>
  );
}
