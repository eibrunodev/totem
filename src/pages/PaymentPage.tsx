import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PaymentMethod } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useCompany } from '@/contexts/CompanyContext';
import { orderService, paymentService, printerService } from '@/services';
import { TotemHeader } from '@/components/totem/TotemHeader';
import { formatCurrency } from '@/utils/format';
import { toOrderItems } from '@/utils/cart';
import { ROUTES } from '@/config/constants';

type Stage = 'select' | 'processing' | 'approved';

const METHOD_INFO: Record<PaymentMethod, { icon: string; title: string; sub: string }> = {
  PIX: { icon: '⚡', title: 'PIX', sub: 'Pagamento instantâneo' },
  DEBIT: { icon: '💳', title: 'Cartão de Débito', sub: 'Insira ou aproxime seu cartão' },
  CREDIT: { icon: '💳', title: 'Cartão de Crédito', sub: 'Insira ou aproxime seu cartão' },
};

/** Pagamento simulado com estados de processamento e aprovação. */
export function PaymentPage() {
  const navigate = useNavigate();
  const { companyId, settings } = useCompany();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clear);
  const customerName = useSessionStore((s) => s.customerName);
  const setPaymentMethod = useSessionStore((s) => s.setPaymentMethod);
  const setLastOrder = useSessionStore((s) => s.setLastOrder);

  const [stage, setStage] = useState<Stage>('select');

  if (items.length === 0 && stage === 'select') {
    navigate(ROUTES.menu, { replace: true });
    return null;
  }

  const feeRate = settings?.serviceFeeRate ?? 0;
  const serviceFee = subtotal * feeRate;
  const total = subtotal + serviceFee;
  const methods = settings?.enabledPaymentMethods ?? ['PIX', 'DEBIT', 'CREDIT'];

  const pay = async (method: PaymentMethod) => {
    setPaymentMethod(method);
    setStage('processing');

    try {
      // 1) Cria o pedido (aguardando pagamento).
      const order = await orderService.createOrder({
        companyId,
        customerName,
        items: toOrderItems(items),
        subtotal,
        serviceFee,
        total,
      });

      // 2) Processa o pagamento (mock — troque por gateway real).
      const result = await paymentService.process({
        companyId,
        orderId: order.id,
        method,
        amount: total,
      });

      if (!result.approved) {
        // A UI já está preparada para pagamento recusado.
        alert('Pagamento não aprovado. Tente outra forma de pagamento.');
        setStage('select');
        return;
      }

      // 3) Confirma pagamento → envia o pedido para a cozinha (KDS).
      const paidOrder = await orderService.markPaid(order.id, method);

      // 4) Envia para impressão (mock — futura impressora térmica).
      await printerService.printOrder(paidOrder);

      setLastOrder(paidOrder);
      clearCart();
      setStage('approved');

      // 5) Avança para a tela de sucesso.
      setTimeout(() => navigate(ROUTES.orderComplete), 1200);
    } catch {
      alert('Ocorreu um erro ao processar o pedido. Tente novamente.');
      setStage('select');
    }
  };

  return (
    <>
      <TotemHeader
        title="Pagamento"
        onBack={stage === 'select' ? () => navigate(ROUTES.summary) : undefined}
        showCart={false}
      />

      <div className="screen-body">
        <h2 className="h2" style={{ marginBottom: '0.25rem' }}>
          Escolha a forma de pagamento
        </h2>
        <p className="text-muted" style={{ marginBottom: '1.25rem' }}>
          Total a pagar: <strong>{formatCurrency(total)}</strong>
        </p>

        <div className="pay-methods">
          {methods.map((method) => {
            const info = METHOD_INFO[method];
            return (
              <button key={method} className="pay-method" onClick={() => pay(method)}>
                <span className="pay-method__icon">{info.icon}</span>
                <span className="pay-method__text">
                  <span className="pay-method__title">{info.title}</span>
                  <span className="pay-method__sub">{info.sub}</span>
                </span>
                <span className="pay-method__arrow">›</span>
              </button>
            );
          })}
        </div>
      </div>

      {stage === 'processing' && (
        <div className="pay-overlay fade-up">
          <div className="spinner" />
          <div>
            <p className="pay-overlay__title">Processando pagamento…</p>
            <p className="pay-overlay__sub">Não retire o cartão.</p>
          </div>
        </div>
      )}

      {stage === 'approved' && (
        <div className="pay-overlay fade-up">
          <div className="pay-overlay__check pop">✓</div>
          <p className="pay-overlay__title">Pagamento aprovado!</p>
        </div>
      )}
    </>
  );
}
