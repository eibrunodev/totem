import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, ProductAddon } from '@/types';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useCartStore } from '@/stores/cartStore';
import { TotemHeader } from '@/components/totem/TotemHeader';
import { CategoryTabs } from '@/components/totem/CategoryTabs';
import { ProductCard } from '@/components/totem/ProductCard';
import { CartBar } from '@/components/totem/CartBar';
import { ProductModal } from '@/components/totem/ProductModal';
import { Loading, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { ROUTES } from '@/config/constants';

/** Cardápio: categorias + grade de produtos. */
export function MenuPage() {
  const navigate = useNavigate();
  const categoriesState = useCategories();
  const productsState = useProducts();
  const addItem = useCartStore((s) => s.addItem);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = categoriesState.data ?? [];
  const products = productsState.data ?? [];

  // Seleciona a primeira categoria assim que os dados chegam.
  useEffect(() => {
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const visibleProducts = useMemo(
    () => products.filter((p) => p.categoryId === activeCategory),
    [products, activeCategory]
  );

  const handleConfirm = (quantity: number, addons: ProductAddon[]) => {
    if (!selectedProduct) return;
    addItem(selectedProduct, quantity, addons);
    setSelectedProduct(null);
  };

  const loading = categoriesState.loading || productsState.loading;
  const error = categoriesState.error || productsState.error;

  return (
    <>
      <TotemHeader title="Cardápio" onBack={() => navigate(ROUTES.home)} />

      {loading ? (
        <Loading label="Carregando o cardápio…" />
      ) : error ? (
        <ErrorState onRetry={() => { categoriesState.reload(); productsState.reload(); }} />
      ) : (
        <>
          <CategoryTabs
            categories={categories}
            activeId={activeCategory}
            onSelect={setActiveCategory}
          />

          <div className="menu-body">
            {visibleProducts.length === 0 ? (
              <EmptyState title="Nenhum produto nesta categoria" />
            ) : (
              <div className="product-grid">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <CartBar />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
