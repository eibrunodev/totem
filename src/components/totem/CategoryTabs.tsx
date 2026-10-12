import type { Category } from '@/types';

interface CategoryTabsProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

/** Abas de categorias roláveis horizontalmente (touch). */
export function CategoryTabs({ categories, activeId, onSelect }: CategoryTabsProps) {
  return (
    <nav className="cat-tabs" aria-label="Categorias">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`cat-tab ${cat.id === activeId ? 'is-active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          <span className="cat-tab__icon">{cat.icon}</span>
          <span className="cat-tab__name">{cat.name}</span>
        </button>
      ))}
    </nav>
  );
}
