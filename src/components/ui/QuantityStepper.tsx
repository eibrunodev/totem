import './QuantityStepper.css';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'md' | 'lg';
}

/** Controle [-] N [+] grande para toque. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
}: QuantityStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className={`stepper stepper-${size}`}>
      <button
        className="stepper__btn"
        onClick={dec}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <span className="stepper__value" aria-live="polite">
        {value}
      </span>
      <button
        className="stepper__btn"
        onClick={inc}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  );
}
