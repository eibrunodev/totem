import type { ICompanyService } from './types';
import type { Company, Settings } from '@/types';
import { mockCompanies } from '@/mock/companies';
import { mockSettings } from '@/mock/settings';
import { MOCK_LATENCY } from '@/config/constants';
import { delay } from './delay';

/**
 * Implementação MOCK de companyService.
 * Substituir por SupabaseCompanyService no futuro
 * (SELECT em `companies` / `settings` filtrando por RLS).
 */
export const mockCompanyService: ICompanyService = {
  async getCompany(companyId: string): Promise<Company | null> {
    const company = mockCompanies.find((c) => c.id === companyId) ?? null;
    return delay(company, MOCK_LATENCY.fast);
  },

  async getSettings(companyId: string): Promise<Settings> {
    const settings = mockSettings[companyId] ?? mockSettings['company-001'];
    return delay(settings, MOCK_LATENCY.fast);
  },
};
