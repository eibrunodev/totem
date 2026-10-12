import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { catalogStore } from '@/services/catalogStore';
import { parseMenuFile, type ImportResult } from '@/services/menuImport';
import { fileToDataUrl } from '@/utils/image';
import { mockCompanies } from '@/mock/companies';
import { foodImage } from '@/mock/foodImage';
import { createId } from '@/utils/id';
import { formatCurrency } from '@/utils/format';
import { ROUTES } from '@/config/constants';
import { useCompany } from '@/contexts/CompanyContext';
import './AdminMenuPage.css';

/** Painel de administração do cardápio: importar planilha + editar. */
export function AdminMenuPage() {
  // Empresa ativa é GLOBAL — mudar aqui muda o que o totem exibe.
  const { companyId, setCompanyId } = useCompany();
  const [version, setVersion] = useState(0); // força releitura do catalogStore
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Produtos atuais da empresa (relidos quando `version` muda).
  const products = useMemo(
    () => catalogStore.getProducts(companyId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [companyId, version]
  );
  const refresh = () => setVersion((v) => v + 1);

  // ---- Importação da planilha ----
  const onPickFile = async (file: File) => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await parseMenuFile(file, companyId);
      setPreview(result);
    } catch {
      setMessage('Não foi possível ler a planilha. Confira o formato.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const confirmImport = () => {
    if (!preview) return;
    catalogStore.replaceCompanyCatalog(companyId, preview.categories, preview.products);
    setMessage(
      `Cardápio importado: ${preview.products.length} produtos em ${preview.categories.length} categorias.`
    );
    setPreview(null);
    refresh();
  };

  // ---- Edição de produto ----
  const patch = (id: string, data: Partial<Product>) => {
    catalogStore.updateProduct(id, data);
    refresh();
  };

  const changeImage = async (id: string, file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      patch(id, { image: dataUrl });
    } catch {
      setMessage('Não foi possível processar a imagem.');
    }
  };

  const addProduct = () => {
    const cats = catalogStore.getCategories(companyId);
    catalogStore.addProduct({
      id: createId('prod'),
      companyId,
      categoryId: cats[0]?.id ?? `cat-${companyId}-geral`,
      name: 'Novo produto',
      description: '',
      price: 0,
      image: foodImage({ emoji: '🍽️', from: '#94a3b8', to: '#475569' }),
      available: true,
      addons: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    refresh();
  };

  const removeProduct = (id: string) => {
    catalogStore.removeProduct(id);
    refresh();
  };

  return (
    <div className="adminmenu">
      <header className="adminmenu__header">
        <div>
          <h1 className="adminmenu__title">Cardápio da empresa</h1>
          <p className="adminmenu__subtitle">Importe a planilha e ajuste os produtos.</p>
        </div>
        <Link to={ROUTES.admin} className="btn btn-secondary">
          Voltar ao admin
        </Link>
      </header>

      {/* Seletor de empresa (multiempresa) */}
      <div className="adminmenu__toolbar">
        <label className="adminmenu__field">
          <span>Empresa</span>
          <select
            className="adminmenu__select"
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setPreview(null);
              setMessage(null);
            }}
          >
            {mockCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.logo} {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="adminmenu__actions">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && onPickFile(e.target.files[0])}
          />
          <button
            className="btn btn-primary"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            {busy ? 'Lendo…' : '⬆ Importar planilha'}
          </button>
          <button className="btn btn-secondary" onClick={addProduct}>
            + Produto
          </button>
        </div>
      </div>

      {message && <div className="adminmenu__msg">{message}</div>}

      {/* Pré-visualização da importação */}
      {preview && (
        <div className="adminmenu__preview">
          <h3 className="h3">Pré-visualização</h3>
          <p>
            {preview.products.length} produtos · {preview.categories.length} categorias
          </p>
          {preview.warnings.length > 0 && (
            <ul className="adminmenu__warnings">
              {preview.warnings.map((w, i) => (
                <li key={i}>⚠ {w}</li>
              ))}
            </ul>
          )}
          <p className="adminmenu__preview-note">
            Isso substitui o cardápio atual desta empresa. As fotos serão os
            placeholders — envie as imagens reais abaixo depois de confirmar.
          </p>
          <div className="row gap">
            <button className="btn btn-success" onClick={confirmImport}>
              Confirmar importação
            </button>
            <button className="btn btn-ghost" onClick={() => setPreview(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de produtos editáveis */}
      <div className="adminmenu__list">
        {products.length === 0 ? (
          <p className="text-muted">Nenhum produto. Importe uma planilha para começar.</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="pedit">
              <div className="pedit__imgwrap">
                <img className="pedit__img" src={p.image} alt={p.name} />
                <label className="pedit__imgbtn">
                  Trocar imagem
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files?.[0] && changeImage(p.id, e.target.files[0])}
                  />
                </label>
              </div>

              <div className="pedit__fields">
                <input
                  className="pedit__input pedit__name"
                  defaultValue={p.name}
                  onBlur={(e) => e.target.value !== p.name && patch(p.id, { name: e.target.value })}
                />
                <textarea
                  className="pedit__input pedit__desc"
                  defaultValue={p.description}
                  rows={2}
                  onBlur={(e) =>
                    e.target.value !== p.description && patch(p.id, { description: e.target.value })
                  }
                />
                <div className="pedit__row">
                  <label className="pedit__price">
                    R$
                    <input
                      className="pedit__input"
                      type="number"
                      step="0.01"
                      defaultValue={p.price}
                      onBlur={(e) => {
                        const price = Number(e.target.value);
                        if (Number.isFinite(price) && price !== p.price) patch(p.id, { price });
                      }}
                    />
                  </label>
                  <label className="pedit__toggle">
                    <input
                      type="checkbox"
                      checked={p.available}
                      onChange={(e) => patch(p.id, { available: e.target.checked })}
                    />
                    Disponível
                  </label>
                  <span className="pedit__preview-price">{formatCurrency(p.price)}</span>
                </div>
              </div>

              <button
                className="pedit__delete"
                onClick={() => removeProduct(p.id)}
                aria-label="Remover produto"
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}