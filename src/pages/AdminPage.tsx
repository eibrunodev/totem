import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import './AdminPage.css';

/**
 * Placeholder do painel administrativo (rota /admin).
 * A rota e o layout já existem; os módulos serão implementados
 * numa próxima fase (protegidos por autenticação + RLS).
 */
const MODULES = [
  { icon: '🍔', name: 'Produtos', desc: 'Cadastro e edição do cardápio' },
  { icon: '🗂️', name: 'Categorias', desc: 'Organização do cardápio' },
  { icon: '🧾', name: 'Pedidos', desc: 'Histórico e acompanhamento' },
  { icon: '📊', name: 'Relatórios', desc: 'Vendas e desempenho' },
  { icon: '⚙️', name: 'Configurações', desc: 'Taxas, pagamento, operação' },
  { icon: '🖨️', name: 'Impressoras', desc: 'Impressão térmica da cozinha' },
  { icon: '💳', name: 'Formas de pagamento', desc: 'PIX, débito, crédito' },
  { icon: '👥', name: 'Usuários', desc: 'Papéis e permissões' },
  { icon: '🏢', name: 'Empresa', desc: 'Dados e identidade visual' },
];

export function AdminPage() {
  return (
    <div className="admin">
      <header className="admin__header">
        <h1 className="admin__title">Painel administrativo</h1>
        <Link to={ROUTES.home} className="btn btn-secondary">
          Voltar ao Totem
        </Link>
      </header>

      <div className="admin__notice">
        🔒 Área futura. A arquitetura já está preparada para autenticação
        (Supabase Auth), multiempresa (companyId) e permissões por papel
        (ADMIN, MANAGER, KITCHEN, CASHIER, TOTEM).
      </div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Link to={ROUTES.adminMenu} className="btn btn-primary btn-lg">
          🍔 Gerenciar cardápio (importar planilha / editar produtos)
        </Link>
      </div>
      <div className="admin__grid">
        {MODULES.map((m) => (
          <div key={m.name} className="admin__card">
            <span className="admin__icon">{m.icon}</span>
            <div>
              <h3 className="admin__card-title">{m.name}</h3>
              <p className="admin__card-desc">{m.desc}</p>
            </div>
            <span className="admin__soon">Em breve</span>
          </div>
        ))}
      </div>
    </div>
  );
}
