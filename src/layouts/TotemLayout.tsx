import { Outlet, useLocation } from 'react-router-dom';
import { useCompany } from '@/contexts/CompanyContext';
import { Loading } from '@/components/ui/Feedback';
import './TotemLayout.css';

/**
 * Layout do modo Totem: container centralizado, ocupa a tela toda
 * e limita a largura para se comportar bem em tablets na vertical
 * e na horizontal. Não renderiza menus administrativos.
 */
export function TotemLayout() {
  const { loading } = useCompany();
  const location = useLocation();

  return (
    <div className="totem">
      <div className="totem__frame">
        {loading ? (
          <Loading label="Preparando o cardápio…" />
        ) : (
          // key por rota → dispara a animação de transição entre telas
          <div key={location.pathname} className="totem__screen fade-up">
            <Outlet />
          </div>
        )}
      </div>
    </div>
  );
}
