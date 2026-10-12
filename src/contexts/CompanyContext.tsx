/**
 * CompanyContext — carrega a empresa atual e suas configurações.
 *
 * É o ponto de entrada da arquitetura MULTIEMPRESA: todo o app
 * lê `companyId` e `settings` daqui. A empresa ativa é persistida
 * em localStorage (fallback: VITE_DEFAULT_COMPANY_ID). Assim, ao
 * trocar de empresa no admin, o totem reflete a mudança na hora.
 * No futuro, com Supabase Auth, virá do usuário logado / subdomínio.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Company, Settings } from '@/types';
import { companyService } from '@/services';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/config/constants';

interface CompanyContextValue {
  companyId: string;
  company: Company | null;
  settings: Settings | null;
  loading: boolean;
  /** Troca a empresa ativa (persistida). */
  setCompanyId: (id: string) => void;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

function readInitialCompanyId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.currentCompany);
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  return env.defaultCompanyId;
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companyId, setCompanyIdState] = useState<string>(readInitialCompanyId);
  const [company, setCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const setCompanyId = useCallback((id: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.currentCompany, id);
    } catch {
      /* ignore */
    }
    setCompanyIdState(id);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      companyService.getCompany(companyId),
      companyService.getSettings(companyId),
    ])
      .then(([c, s]) => {
        if (!active) return;
        setCompany(c);
        setSettings(s);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [companyId]);

  // Sincroniza a empresa entre abas do mesmo navegador.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.currentCompany && e.newValue && e.newValue !== companyId) {
        setCompanyIdState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [companyId]);

  // Aplica a cor primária da empresa como CSS var (white-label).
  useEffect(() => {
    if (company) {
      document.documentElement.style.setProperty('--brand', company.primaryColor);
    }
  }, [company]);

  const value = useMemo(
    () => ({ companyId, company, settings, loading, setCompanyId }),
    [companyId, company, settings, loading, setCompanyId]
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany deve ser usado dentro de CompanyProvider');
  return ctx;
}