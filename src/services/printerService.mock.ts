import type { IPrinterService } from './types';
import type { Order } from '@/types';
import { formatCurrency, formatOrderNumber } from '@/utils/format';

/**
 * Implementação MOCK de printerService.
 *
 * Por enquanto apenas "imprime" no console um comprovante formatado.
 * Futuramente esta camada enviará o pedido para uma impressora
 * térmica da cozinha, por exemplo via:
 *   - um endpoint no backend (Totem → API → impressora ESC/POS);
 *   - QZ Tray / WebUSB para impressão local;
 *   - integração com o app da impressora.
 * Como a UI só chama `printerService.printOrder(order)`, a troca
 * é transparente.
 */
export const mockPrinterService: IPrinterService = {
  async printOrder(order: Order): Promise<void> {
    const lines = [
      '==============================',
      '        TOTEMFOOD',
      '==============================',
      `Pedido: ${formatOrderNumber(order.number)}`,
      `Cliente: ${order.customerName}`,
      '------------------------------',
      ...order.items.map(
        (i) => `${i.quantity}x ${i.name}  ${formatCurrency(i.lineTotal)}`
      ),
      '------------------------------',
      `TOTAL: ${formatCurrency(order.total)}`,
      `Pagamento: ${order.paymentMethod ?? '-'}`,
      '==============================',
    ];
    // eslint-disable-next-line no-console
    console.log('[printerService:MOCK] Comanda da cozinha:\n' + lines.join('\n'));
  },
};
