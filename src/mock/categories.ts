import type { Category } from '@/types';

const now = '2025-01-01T12:00:00.000Z';

/** Categorias da empresa de demonstração (company-001). */
export const mockCategories: Category[] = [
  {
    id: 'cat-burgers',
    companyId: 'company-001',
    name: 'Hambúrgueres',
    icon: '🍔',
    sortOrder: 1,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-combos',
    companyId: 'company-001',
    name: 'Combos',
    icon: '🍟',
    sortOrder: 2,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-sides',
    companyId: 'company-001',
    name: 'Porções',
    icon: '🍗',
    sortOrder: 3,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-drinks',
    companyId: 'company-001',
    name: 'Bebidas',
    icon: '🥤',
    sortOrder: 4,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-desserts',
    companyId: 'company-001',
    name: 'Sobremesas',
    icon: '🍰',
    sortOrder: 5,
    active: true,
    createdAt: now,
    updatedAt: now,
  },
];
