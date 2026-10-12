import { Routes, Route, Navigate } from 'react-router-dom';
import { TotemLayout } from '@/layouts/TotemLayout';
import { HomePage } from '@/pages/HomePage';
import { MenuPage } from '@/pages/MenuPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { IdentificationPage } from '@/pages/IdentificationPage';
import { SummaryPage } from '@/pages/SummaryPage';
import { PaymentPage } from '@/pages/PaymentPage';
import { OrderCompletePage } from '@/pages/OrderCompletePage';
import { KitchenPage } from '@/pages/KitchenPage';
import { AdminPage } from '@/pages/AdminPage';
import { AdminMenuPage } from '@/pages/AdminMenuPage';

/**
 * Mapa de rotas da aplicação.
 *  - Fluxo do totem: envolto no TotemLayout (tela cheia, sem menus).
 *  - Cozinha (/cozinha) e Admin (/admin): telas independentes, que
 *    poderão rodar em outros dispositivos.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Fluxo do totem */}
      <Route element={<TotemLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cardapio" element={<MenuPage />} />
        <Route path="/produto/:id" element={<ProductPage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/identificacao" element={<IdentificationPage />} />
        <Route path="/resumo" element={<SummaryPage />} />
        <Route path="/pagamento" element={<PaymentPage />} />
        <Route path="/pedido-finalizado" element={<OrderCompletePage />} />
        <Route path="/admin/cardapio" element={<AdminMenuPage />} />
      </Route>

      {/* Telas independentes */}
      <Route path="/cozinha" element={<KitchenPage />} />
      <Route path="/admin" element={<AdminPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
