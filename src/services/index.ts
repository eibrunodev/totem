/**
 * ============================================================
 * Fábrica de serviços (Service Locator)
 * ------------------------------------------------------------
 * Este é o ÚNICO lugar que decide qual implementação usar.
 * Hoje retorna sempre as versões MOCK. Quando o Supabase estiver
 * pronto, crie os arquivos `*.supabase.ts` (respeitando as
 * interfaces em `./types`) e troque as linhas abaixo com base
 * em `env.dataSource`:
 *
 *   export const productService = isMockMode
 *     ? mockProductService
 *     : supabaseProductService;
 *
 * A aplicação inteira importa daqui (`@/services`), então nenhum
 * componente precisa saber se os dados são mock ou reais.
 * ============================================================
 */
import { isMockMode } from '@/config/env';

import { mockCompanyService } from './companyService.mock';
import { mockProductService } from './productService.mock';
import { mockOrderService } from './orderService.mock';
import { mockPaymentService } from './paymentService.mock';
import { mockKitchenService } from './kitchenService.mock';
import { mockPrinterService } from './printerService.mock';

import type {
  ICompanyService,
  IProductService,
  IOrderService,
  IPaymentService,
  IKitchenService,
  IPrinterService,
} from './types';

// Enquanto não houver SupabaseService, ambos os ramos apontam para
// a implementação mock. A ramificação já está pronta para o futuro.
export const companyService: ICompanyService = isMockMode
  ? mockCompanyService
  : mockCompanyService;

export const productService: IProductService = isMockMode
  ? mockProductService
  : mockProductService;

export const orderService: IOrderService = isMockMode
  ? mockOrderService
  : mockOrderService;

export const paymentService: IPaymentService = isMockMode
  ? mockPaymentService
  : mockPaymentService;

export const kitchenService: IKitchenService = isMockMode
  ? mockKitchenService
  : mockKitchenService;

export const printerService: IPrinterService = isMockMode
  ? mockPrinterService
  : mockPrinterService;

export { mockStore } from './mockStore';
export * from './types';
