import type { ReactNode } from 'react';
import './Feedback.css';

/** Tela/área de carregamento com spinner. */
export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="feedback">
      <div className="spinner spinner-dark" />
      <p className="feedback__label">{label}</p>
    </div>
  );
}

/** Estado vazio genérico (empty state). */
export function EmptyState({
  icon = '🍽️',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="feedback">
      <div className="feedback__icon">{icon}</div>
      <h3 className="h3">{title}</h3>
      {description && <p className="text-muted">{description}</p>}
      {action}
    </div>
  );
}

/** Estado de erro genérico com ação de tentar novamente. */
export function ErrorState({
  title = 'Algo deu errado',
  onRetry,
}: {
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="feedback">
      <div className="feedback__icon">⚠️</div>
      <h3 className="h3">{title}</h3>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
