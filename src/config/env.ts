/**
 * Configuração central lida de variáveis de ambiente (Vite).
 * Mantém um único ponto de acesso para não espalhar
 * `import.meta.env` pela aplicação.
 */

type DataSource = 'mock' | 'supabase';

const rawSource = (import.meta.env.VITE_DATA_SOURCE as string) ?? 'mock';

export const env = {
  /**
   * Fonte de dados ativa. Enquanto for "mock", toda a aplicação
   * roda com dados fictícios. Trocar para "supabase" (e preencher
   * as chaves abaixo) ativa a implementação real nos serviços.
   */
  dataSource: (rawSource === 'supabase' ? 'supabase' : 'mock') as DataSource,

  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string) ?? '',
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '',

  /** Empresa carregada por padrão no totem (multiempresa). */
  defaultCompanyId:
    (import.meta.env.VITE_DEFAULT_COMPANY_ID as string) ?? 'company-001',
} as const;

/** True quando a aplicação está rodando com dados mockados. */
export const isMockMode = env.dataSource === 'mock';
