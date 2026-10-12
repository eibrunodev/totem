import type { Settings } from '@/types';
import { INITIAL_ORDER_NUMBER } from '@/config/constants';

/** Configurações mockadas por empresa. */
export const mockSettings: Record<string, Settings> = {
  'company-001': {
    companyId: 'company-001',
    serviceFeeRate: 0, // sem taxa por padrão (troque para 0.1 = 10%)
    nextOrderNumber: INITIAL_ORDER_NUMBER,
    askCustomerName: true,
    enabledPaymentMethods: ['PIX', 'DEBIT', 'CREDIT'],
  },
  'company-002': {
    companyId: 'company-002',
    serviceFeeRate: 0.1,
    nextOrderNumber: 500,
    askCustomerName: true,
    enabledPaymentMethods: ['PIX', 'CREDIT'],
  },
};
