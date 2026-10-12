import { STORAGE_KEYS } from "@/config/constants";
import type { Category, Product } from "@/types";
import { mockCategories } from "@/mock/categories";
import { mockProducts } from "@/mock/products";

type Listener = () => void;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota cheia ou indisponível — segue em memória */
  }
}

class CatalogStore {
  private categories: Category[];
  private products: Product[];
  private listeners = new Set<Listener>();

  constructor() {
    this.categories = read<Category[]>(STORAGE_KEYS.catalogCategories, mockCategories);
    this.products = read<Product[]>(STORAGE_KEYS.catalogProducts, mockProducts);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private persistAndNotify(): void {
    write(STORAGE_KEYS.catalogCategories, this.categories);
    write(STORAGE_KEYS.catalogProducts, this.products);
    this.listeners.forEach((l) => l());
  }

  getCategories(companyId: string): Category[] {
    return this.categories
      .filter((c) => c.companyId === companyId && c.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getProducts(companyId: string): Product[] {
    return this.products.filter((p) => p.companyId === companyId);
  }

  getProductById(companyId: string, id: string): Product | undefined {
    return this.products.find((p) => p.companyId === companyId && p.id === id);
  }

  // Importação: substitui o cardápio inteiro da empresa
  replaceCompanyCatalog(companyId: string, categories: Category[], products: Product[]): void {
    this.categories = [
      ...this.categories.filter((c) => c.companyId !== companyId),
      ...categories,
    ];
    this.products = [
      ...this.products.filter((p) => p.companyId !== companyId),
      ...products,
    ];
    this.persistAndNotify();
  }

  updateProduct(id: string, patch: Partial<Product>): void {
    this.products = this.products.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
    );
    this.persistAndNotify();
  }

  addProduct(product: Product): void {
    this.products = [product, ...this.products];
    this.persistAndNotify();
  }

  removeProduct(id: string): void {
    this.products = this.products.filter((p) => p.id !== id);
    this.persistAndNotify();
  }

  resetToMock(): void {
    this.categories = mockCategories;
    this.products = mockProducts;
    this.persistAndNotify();
  }
}

export const catalogStore = new CatalogStore();