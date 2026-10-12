import type { CartItem } from '@/stores/cartStore';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { formatCurrency } from '@/utils/format';
import { calcLineTotal } from '@/utils/cart';

interface CartItemRowProps {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

/** Linha de item no carrinho, com controle de quantidade e remover. */
export function CartItemRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemRowProps) {
  const lineTotal = calcLineTotal(item.unitPrice, item.selectedAddons, item.quantity);

  return (
    <div className="cart-item">
      <img className="cart-item__img" src={item.image} alt={item.name} />
      <div className="cart-item__info">
        <h3 className="cart-item__name">{item.name}</h3>
        {item.selectedAddons.length > 0 && (
          <p className="cart-item__addons">
            + {item.selectedAddons.map((a) => a.name).join(', ')}
          </p>
        )}
        <p className="cart-item__unit">{formatCurrency(item.unitPrice)} / un.</p>
        <div className="cart-item__controls">
          <QuantityStepper
            value={item.quantity}
            min={1}
            onChange={(next) => (next > item.quantity ? onIncrement() : onDecrement())}
          />
          <button className="cart-item__remove" onClick={onRemove}>
            Remover
          </button>
        </div>
      </div>
      <div className="cart-item__total">{formatCurrency(lineTotal)}</div>
    </div>
  );
}
