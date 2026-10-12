import type { IProductService } from './types';
import type { Category, Product } from '@/types';
import { catalogStore } from './catalogStore';
import { MOCK_LATENCY } from '@/config/constants';
import { delay } from './delay';

export const mockProductService: IProductService = {
  async getCategories(companyId: string): Promise<Category[]> {
    return delay(catalogStore.getCategories(companyId), MOCK_LATENCY.normal);
  },
  async getProducts(companyId: string): Promise<Product[]> {
    return delay(catalogStore.getProducts(companyId), MOCK_LATENCY.normal);
  },
  async getProductById(companyId: string, id: string): Promise<Product | null> {
    return delay(catalogStore.getProductById(companyId, id) ?? null, MOCK_LATENCY.fast);
  },
};
