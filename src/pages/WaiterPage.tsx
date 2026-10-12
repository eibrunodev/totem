import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { KitchenOrder, OrderItem, Product, ProductAddon, PaymentMethod } from '@/types';
import { useCompany } from '@/contexts/CompanyContext';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { CategoryTabs } from '@/components/totem/CategoryTabs';
import { ProductCard } from '@/components/totem/ProductCard';
import { ProductModal } from '@/components/totem/ProductModal';
import { Loading, EmptyState, ErrorState } from '@/components/ui/Feedback';
import { paymentService, mockStore } from '@/services';
import { formatCurrency } from '@/utils/format';
import { createId } from '@/utils/id';
import { ROUTES } from '@/config/constants';
import './WaiterPage.css';

const TABLE_COUNT = 12;
const TABLE_STORAGE_KEY = 'totemfood.tableSessions';
const TABLE_ORDER_NUMBER_KEY = 'totemfood.tableOrderNumber';

interface DraftItem {
  product: Product;
  quantity: number;
  selectedAddons: ProductAddon[];
}

interface TableSession {
  tableNumber: number;
  customerName: string;
  openedAt: string;
  items: OrderItem[];
}

function readSessions(): Record<number, TableSession> {
  try {
    const raw = localStorage.getItem(TABLE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<number, TableSession>) : {};
  } catch {
    return {};
  }
}

function getNextKitchenNumber(): number {
  try {
    const next = Number(localStorage.getItem(TABLE_ORDER_NUMBER_KEY) || '2000') + 1;
    localStorage.setItem(TABLE_ORDER_NUMBER_KEY, String(next));
    return next;
  } catch {
    return 2001 + Math.floor(Date.now() % 1000);
  }
}

function draftTotal(item: DraftItem): number {
  const addons = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  return (item.product.price + addons) * item.quantity;
}

function toOrderItems(items: DraftItem[]): OrderItem[] {
  return items.map((item) => {
    const addonsTotal = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    return {
      id: createId('oi'),
      productId: item.product.id,
      name: item.product.name,
      unitPrice: item.product.price,
      quantity: item.quantity,
      selectedAddons: item.selectedAddons,
      lineTotal: (item.product.price + addonsTotal) * item.quantity,
    };
  });
}

function itemsTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.lineTotal, 0);
}

/** Atendimento de mesas para garçons. Dados de comanda simulados em localStorage. */
export function WaiterPage() {
  const { companyId } = useCompany();
  const categoriesState = useCategories();
  const productsState = useProducts();
  const [sessions, setSessions] = useState<Record<number, TableSession>>(readSessions);
  const [activeTable, setActiveTable] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(TABLE_STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      setFeedback('Não foi possível salvar as comandas neste navegador.');
    }
  }, [sessions]);

  useEffect(() => {
    if (!activeCategory && categoriesState.data?.length) {
      setActiveCategory(categoriesState.data[0].id);
    }
  }, [activeCategory, categoriesState.data]);

  const categories = categoriesState.data ?? [];
  const products = productsState.data ?? [];
  const visibleProducts = useMemo(
    () => products.filter((product) => product.categoryId === activeCategory && product.available),
    [products, activeCategory]
  );
  const currentSession = activeTable === null ? null : sessions[activeTable] ?? null;
  const draftTotalValue = draftItems.reduce((sum, item) => sum + draftTotal(item), 0);
  const currentTotal = currentSession ? itemsTotal(currentSession.items) : 0;
  const loading = categoriesState.loading || productsState.loading;
  const error = categoriesState.error || productsState.error;

  const openTable = (tableNumber: number) => {
    setSessions((current) => {
      if (current[tableNumber]) return current;
      return {
        ...current,
        [tableNumber]: {
          tableNumber,
          customerName: '',
          openedAt: new Date().toISOString(),
          items: [],
        },
      };
    });
    setDraftItems([]);
    setShowCheckout(false);
    setFeedback('');
    setActiveTable(tableNumber);
  };

  const updateCustomerName = (customerName: string) => {
    if (activeTable === null) return;
    setSessions((current) => ({
      ...current,
      [activeTable]: { ...current[activeTable], customerName },
    }));
  };

  const addDraftItem = (quantity: number, selectedAddons: ProductAddon[]) => {
    if (!selectedProduct) return;
    setDraftItems((current) => [
      ...current,
      { product: selectedProduct, quantity, selectedAddons },
    ]);
    setSelectedProduct(null);
    setFeedback('Produto adicionado ao pedido pendente.');
  };

  const sendToKitchen = () => {
    if (activeTable === null || !currentSession || draftItems.length === 0) return;
    const orderItems = toOrderItems(draftItems);
    const batchTotal = itemsTotal(orderItems);
    const orderNumber = getNextKitchenNumber();
    const kitchenOrder: KitchenOrder = {
      id: createId('ko'),
      companyId,
      orderId: createId('table-order'),
      number: orderNumber,
      customerName: `Mesa ${activeTable}${currentSession.customerName ? ` · ${currentSession.customerName}` : ''}`,
      items: orderItems,
      total: batchTotal,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    // Cada envio gera somente uma remessa para a cozinha; a comanda permanece aberta.
    mockStore.pushToKitchen(kitchenOrder);
    setSessions((current) => ({
      ...current,
      [activeTable]: {
        ...current[activeTable],
        items: [...current[activeTable].items, ...orderItems],
      },
    }));
    setDraftItems([]);
    setFeedback(`Pedido #${orderNumber} enviado para a cozinha. A comanda continua aberta.`);
  };

  const checkout = async () => {
    if (activeTable === null || !currentSession || currentSession.items.length === 0) return;
    setProcessingPayment(true);
    setFeedback('');
    try {
      const result = await paymentService.process({
        companyId,
        orderId: `table-${activeTable}-${currentSession.openedAt}`,
        method: paymentMethod,
        amount: currentTotal,
      });
      if (!result.approved) {
        setFeedback('Pagamento não aprovado. A comanda continua aberta.');
        return;
      }
      setSessions((current) => {
        const next = { ...current };
        delete next[activeTable];
        return next;
      });
      setDraftItems([]);
      setShowCheckout(false);
      setActiveTable(null);
      setFeedback(`Pagamento aprovado: ${formatCurrency(currentTotal)}. Comanda encerrada e mesa liberada.`);
    } catch {
      setFeedback('Não foi possível processar o pagamento. A comanda continua aberta.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <main className="waiter">
      <header className="waiter__header">
        <div>
          <p className="waiter__eyebrow">TOTEMFOOD · OPERAÇÃO</p>
          <h1>Atendimento de mesas</h1>
          <p className="waiter__subtitle">Abra comandas, envie pedidos à cozinha e feche a conta quando o cliente solicitar.</p>
        </div>
        <nav className="waiter__nav">
          <Link className="btn btn-secondary" to={ROUTES.home}>Totem</Link>
          <Link className="btn btn-secondary" to={ROUTES.kitchen}>Cozinha (KDS)</Link>
        </nav>
      </header>

      {feedback && <div className="waiter__feedback" role="status">{feedback}</div>}

      {activeTable === null ? (
        <section className="waiter__section">
          <div className="waiter__section-head">
            <div>
              <h2>Mesas</h2>
              <p>Selecione uma mesa para iniciar ou continuar o atendimento.</p>
            </div>
            <div className="waiter__legend">
              <span><i className="waiter__dot waiter__dot--free" /> Livre</span>
              <span><i className="waiter__dot waiter__dot--busy" /> Comanda aberta</span>
            </div>
          </div>
          <div className="waiter__tables">
            {Array.from({ length: TABLE_COUNT }, (_, index) => index + 1).map((tableNumber) => {
              const session = sessions[tableNumber];
              const total = session ? itemsTotal(session.items) : 0;
              return (
                <button
                  key={tableNumber}
                  className={`waiter__table ${session ? 'is-busy' : 'is-free'}`}
                  onClick={() => openTable(tableNumber)}
                >
                  <span className="waiter__table-icon">▦</span>
                  <strong>Mesa {String(tableNumber).padStart(2, '0')}</strong>
                  <span className="waiter__table-status">{session ? 'Comanda aberta' : 'Livre'}</span>
                  {session && <span className="waiter__table-total">{formatCurrency(total)}</span>}
                  {session && <span className="waiter__table-items">{session.items.length} {session.items.length === 1 ? 'item lançado' : 'itens lançados'}</span>}
                </button>
              );
            })}
          </div>
        </section>
      ) : currentSession ? (
        <section className="waiter__workspace">
          <div className="waiter__workspace-head">
            <button className="btn btn-secondary" onClick={() => { setActiveTable(null); setShowCheckout(false); setDraftItems([]); }}>← Todas as mesas</button>
            <div>
              <p className="waiter__eyebrow">COMANDA ABERTA</p>
              <h2>Mesa {String(activeTable).padStart(2, '0')}</h2>
            </div>
            <div className="waiter__bill-total">
              <span>Total lançado</span>
              <strong>{formatCurrency(currentTotal)}</strong>
            </div>
          </div>

          <label className="waiter__customer">
            Nome do cliente (opcional)
            <input value={currentSession.customerName} onChange={(event) => updateCustomerName(event.target.value)} placeholder="Ex.: João" />
          </label>

          <div className="waiter__columns">
            <section className="waiter__menu">
              <div className="waiter__section-head">
                <div><h3>Adicionar produtos</h3><p>Selecione os itens do próximo envio.</p></div>
              </div>
              {loading ? <Loading label="Carregando cardápio…" /> : error ? (
                <ErrorState onRetry={() => { categoriesState.reload(); productsState.reload(); }} />
              ) : (
                <>
                  <CategoryTabs categories={categories} activeId={activeCategory} onSelect={setActiveCategory} />
                  {visibleProducts.length ? (
                    <div className="waiter__products">
                      {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />)}
                    </div>
                  ) : <EmptyState title="Nenhum produto disponível nesta categoria" />}
                </>
              )}
            </section>

            <aside className="waiter__bill">
              <h3>Resumo da comanda</h3>
              {currentSession.items.length === 0 ? <p className="waiter__empty">Ainda não há itens enviados para esta mesa.</p> : (
                <ul className="waiter__bill-list">
                  {currentSession.items.map((item) => (
                    <li key={item.id}>
                      <div><strong>{item.quantity}× {item.name}</strong>
                        {item.selectedAddons.length > 0 && <small>{item.selectedAddons.map((addon) => addon.name).join(', ')}</small>}
                      </div>
                      <span>{formatCurrency(item.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
              )}

              {draftItems.length > 0 && (
                <div className="waiter__pending">
                  <h4>Próximo envio · {draftItems.length} {draftItems.length === 1 ? 'item' : 'itens'}</h4>
                  {draftItems.map((item, index) => (
                    <div className="waiter__pending-row" key={`${item.product.id}-${index}`}>
                      <span>{item.quantity}× {item.product.name}</span>
                      <strong>{formatCurrency(draftTotal(item))}</strong>
                      <button aria-label={`Remover ${item.product.name}`} onClick={() => setDraftItems((current) => current.filter((_, i) => i !== index))}>×</button>
                    </div>
                  ))}
                  <div className="waiter__pending-total"><span>Subtotal do envio</span><strong>{formatCurrency(draftTotalValue)}</strong></div>
                  <button className="btn btn-primary btn-block" onClick={sendToKitchen}>Enviar pedido à cozinha</button>
                </div>
              )}

              {showCheckout ? (
                <div className="waiter__checkout">
                  <h4>Fechar comanda</h4>
                  <p>Confira o total e selecione a forma de pagamento.</p>
                  <div className="waiter__payment-methods">
                    {(['PIX', 'DEBIT', 'CREDIT'] as PaymentMethod[]).map((method) => (
                      <button key={method} className={paymentMethod === method ? 'is-selected' : ''} onClick={() => setPaymentMethod(method)}>
                        {method === 'PIX' ? 'PIX' : method === 'DEBIT' ? 'Débito' : 'Crédito'}
                      </button>
                    ))}
                  </div>
                  <div className="waiter__checkout-total"><span>Total a pagar</span><strong>{formatCurrency(currentTotal)}</strong></div>
                  <button className="btn btn-primary btn-block" disabled={processingPayment} onClick={checkout}>
                    {processingPayment ? 'Processando pagamento…' : 'Confirmar pagamento'}
                  </button>
                  <button className="btn btn-ghost btn-block" disabled={processingPayment} onClick={() => setShowCheckout(false)}>Continuar atendimento</button>
                </div>
              ) : (
                <button
                  className="btn btn-success btn-block"
                  disabled={currentSession.items.length === 0 || draftItems.length > 0}
                  onClick={() => setShowCheckout(true)}
                >
                  Fechar conta · {formatCurrency(currentTotal)}
                </button>
              )}
              {draftItems.length > 0 && <p className="waiter__hint">Envie ou remova os itens pendentes antes de fechar a conta.</p>}
            </aside>
          </div>
        </section>
      ) : null}

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onConfirm={addDraftItem} />
      )}
    </main>
  );
}
