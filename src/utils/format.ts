/** Utilidades de formatação. */

/** Formata um número como moeda brasileira (R$). */
export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

/** Formata um número de pedido no padrão "#1024". */
export function formatOrderNumber(n: number): string {
  return `#${n}`;
}

/** Formata horário (HH:mm) a partir de uma ISO string. */
export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** Minutos decorridos desde uma data (para o KDS). */
export function minutesSince(iso: string): number {
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
}
