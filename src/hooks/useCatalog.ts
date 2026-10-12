import { productService } from '@/services';
import { useCompany } from '@/contexts/CompanyContext';
import { useAsync } from './useAsync';

/** Categorias da empresa atual. */
export function useCategories() {
  const { companyId } = useCompany();
  return useAsync(() => productService.getCategories(companyId), [companyId]);
}

/** Produtos da empresa atual. */
export function useProducts() {
  const { companyId } = useCompany();
  return useAsync(() => productService.getProducts(companyId), [companyId]);
}

/** Um produto específico da empresa atual. */
export function useProduct(id: string | undefined) {
  const { companyId } = useCompany();
  return useAsync(
    () =>
      id
        ? productService.getProductById(companyId, id)
        : Promise.resolve(null),
    [companyId, id]
  );
}
