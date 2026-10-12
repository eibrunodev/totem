/** Geração de identificadores para dados mockados. */

/**
 * Gera um id único simples. Em produção os ids virão do banco
 * (ex.: uuid gerado pelo Postgres/Supabase).
 */
export function createId(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}
