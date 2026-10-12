import * as XLSX from 'xlsx';
import type { Category, Product, ProductAddon } from '@/types';
import { createId } from '@/utils/id';
import { foodImage } from '@/mock/foodImage';

type RawRow = Record<string, string | number | undefined>;

export interface ImportResult {
  categories: Category[];
  products: Product[];
  warnings: string[];
}

function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parsePrice(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const cleaned = value
    .toString()
    .replace(/[^0-9,.-]/g, '')
    .replace(/\.(?=\d{3})/g, '')
    .replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseAddons(companyId: string, raw: string | number | undefined): ProductAddon[] {
  if (!raw) return [];
  return raw
    .toString()
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, price] = part.split(':');
      return { id: createId('add'), companyId, name: (name ?? '').trim(), price: parsePrice(price) };
    })
    .filter((a) => a.name);
}

function isAvailable(value: string | number | undefined): boolean {
  if (value === undefined || value === '') return true;
  const v = value.toString().trim().toLowerCase();
  return !['nao', 'não', 'no', 'false', '0', 'indisponivel', 'indisponível'].includes(v);
}

function normalizeRow(row: RawRow): RawRow {
  const out: RawRow = {};
  for (const key of Object.keys(row)) out[slugify(key).replace(/-/g, '')] = row[key];
  return out;
}

const PLACEHOLDER_COLORS: Array<[string, string]> = [
  ['#f97316', '#ea580c'], ['#22c55e', '#15803d'], ['#3b82f6', '#1d4ed8'],
  ['#a855f7', '#7e22ce'], ['#ef4444', '#991b1b'],
];

export async function parseMenuFile(file: File, companyId: string): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<RawRow>(firstSheet, { defval: '' });

  const warnings: string[] = [];
  const now = new Date().toISOString();
  const categoryByName = new Map<string, Category & { _color?: [string, string] }>();
  const products: Product[] = [];

  rows.forEach((rawRow, index) => {
    const row = normalizeRow(rawRow);
    const categoryName = (row.categoria ?? '').toString().trim();
    const name = (row.nome ?? '').toString().trim();

    if (!name) { warnings.push(`Linha ${index + 2}: sem nome — ignorada.`); return; }
    if (!categoryName) { warnings.push(`Linha ${index + 2}: "${name}" sem categoria — ignorada.`); return; }

    let category = categoryByName.get(categoryName.toLowerCase());
    if (!category) {
      const [from, to] = PLACEHOLDER_COLORS[categoryByName.size % PLACEHOLDER_COLORS.length];
      category = {
        id: `cat-${companyId}-${slugify(categoryName)}`,
        companyId, name: categoryName, icon: '🍽️',
        sortOrder: categoryByName.size + 1, active: true,
        createdAt: now, updatedAt: now, _color: [from, to],
      };
      categoryByName.set(categoryName.toLowerCase(), category);
    }
    const color = category._color ?? PLACEHOLDER_COLORS[0];

    products.push({
      id: createId('prod'), companyId, categoryId: category.id, name,
      description: (row.descricao ?? '').toString().trim(),
      price: parsePrice(row.preco),
      image: foodImage({ emoji: '🍽️', from: color[0], to: color[1] }), // placeholder
      available: isAvailable(row.disponivel),
      addons: parseAddons(companyId, row.adicionais),
      createdAt: now, updatedAt: now,
    });
  });

  const categories = Array.from(categoryByName.values()).map((c) => {
    const clean = { ...c }; delete clean._color; return clean as Category;
  });

  if (products.length === 0) warnings.push('Nenhum produto válido encontrado na planilha.');
  return { categories, products, warnings };
}