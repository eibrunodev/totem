import type { IPaymentService, PaymentResult } from './types';
import type { Payment } from '@/types';
import { MOCK_LATENCY } from '@/config/constants';
import { createId } from '@/utils/id';
import { delay } from './delay';

/**
 * Implementação MOCK de paymentService.
 *
 * IMPORTANTE (arquitetura): a UI de pagamento chama apenas
 * `paymentService.process(...)` e reage ao `PaymentResult`.
 * Para integrar uma maquininha real ou gateway (Stripe, Cielo,
 * PagSeguro, Mercado Pago, PIX via PSP), basta criar um
 * `RealPaymentService` que implemente esta mesma interface —
 * nenhuma tela precisa mudar.
 */
export const mockPaymentService: IPaymentService = {
  async process({ companyId, orderId, method, amount }): Promise<PaymentResult> {
    // Simula o tempo de comunicação com a maquininha/PSP.
    const payment: Payment = {
      id: createId('pay'),
      companyId,
      orderId,
      method,
      status: 'PROCESSING',
      amount,
      createdAt: new Date().toISOString(),
    };

    await delay(null, MOCK_LATENCY.payment);

    // No mock, todo pagamento é aprovado. Um gateway real poderia
    // retornar DECLINED — a UI já está preparada para os dois casos.
    const approved = true;
    const result: PaymentResult = {
      approved,
      payment: {
        ...payment,
        status: approved ? 'APPROVED' : 'DECLINED',
        externalRef: `MOCK-${Math.floor(Math.random() * 1_000_000)}`,
      },
    };
    return result;
  },
};
