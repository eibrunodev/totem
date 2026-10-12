import type { Company } from '@/types';

/**
 * Empresas mockadas. A arquitetura é multiempresa desde já:
 * todo dado (categoria, produto, pedido) referencia um companyId.
 * A empresa "company-001" é a TotemFood usada na demonstração.
 */
export const mockCompanies: Company[] = [
  {
    id: 'company-001',
    name: 'TotemFood',
    slug: 'totemfood',
    logo: '🍔',
    primaryColor: '#f97316',
    currency: 'BRL',
    createdAt: '2025-01-01T12:00:00.000Z',
    updatedAt: '2025-01-01T12:00:00.000Z',
  },
  {
    // Segunda empresa fictícia — demonstra que produtos e preços
    // podem ser completamente diferentes por companyId.
    id: 'company-002',
    name: 'Cafeteria Aroma',
    slug: 'aroma',
    logo: '☕',
    primaryColor: '#7c3aed',
    currency: 'BRL',
    createdAt: '2025-01-01T12:00:00.000Z',
    updatedAt: '2025-01-01T12:00:00.000Z',
  },
];
