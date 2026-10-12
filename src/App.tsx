import { BrowserRouter } from 'react-router-dom';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { AppRoutes } from '@/routes/AppRoutes';

/**
 * Raiz da aplicação.
 * CompanyProvider carrega a empresa atual (multiempresa) e envolve
 * todo o app, para que qualquer tela acesse companyId/settings.
 */
export default function App() {
  return (
    <CompanyProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </CompanyProvider>
  );
}
