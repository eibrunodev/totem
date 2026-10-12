# 🍔 TotemFood — PDV para Totem de Autoatendimento

MVP **frontend** de um sistema de PDV para totens de autoatendimento
(restaurantes, lanchonetes, hamburguerias). Aplicação **totalmente
funcional** com dados **mockados**, mas com arquitetura profissional
preparada para plugar **Supabase + pagamento real + impressora térmica +
KDS em tempo real + multiempresa (SaaS)** sem reescrever o projeto.

> Stack: **React 18 + Vite + TypeScript + React Router + Zustand**.
> Sem dependência de rede para funcionar (imagens são SVG geradas localmente).

---

## 🚀 Como executar

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (por padrão `http://localhost:5173`).

Outros scripts:

```bash
npm run build      # typecheck (tsc) + build de produção
npm run preview    # serve o build de produção
npm run typecheck  # apenas checagem de tipos
```

---

## 🧭 Fluxo do totem

```
Início → Cardápio → Produto → Carrinho → Identificação → Resumo → Pagamento → Pedido concluído
```

Rotas disponíveis:

| Rota | Tela |
|------|------|
| `/` | Tela inicial (Toque para começar) |
| `/cardapio` | Cardápio com categorias e produtos |
| `/produto/:id` | Página de produto (deep-link) |
| `/carrinho` | Carrinho |
| `/identificacao` | Identificação do cliente (opcional) |
| `/resumo` | Resumo do pedido |
| `/pagamento` | Pagamento simulado (PIX / Débito / Crédito) |
| `/pedido-finalizado` | Confirmação do pedido |
| `/cozinha` | **KDS** — painel da cozinha (tempo real) |
| `/admin` | Painel administrativo (placeholder da fase futura) |

---

## ✅ Como testar o fluxo completo

1. Na tela inicial, toque em **COMEÇAR PEDIDO**.
2. Escolha uma categoria, toque em um produto, selecione adicionais e
   quantidade, e toque em **Adicionar**.
3. Adicione mais itens se quiser; toque na barra inferior **Ver pedido**.
4. No carrinho, ajuste quantidades / remova itens e toque em **FINALIZAR PEDIDO**.
5. Informe seu nome (ou pule) → confira o **Resumo** → **CONFIRMAR E PAGAR**.
6. Escolha uma forma de pagamento → veja **Processando…** → **Pagamento aprovado!**.
7. Veja a tela **Pedido realizado com sucesso** com o número do pedido.
8. Abra **`/cozinha`** (de preferência em outra aba): o pedido aparece na
   coluna **Novos** automaticamente. Avance-o por **Novo → Em preparo →
   Pronto → Finalizado**.

> Dica multi-tela: abra `/` e `/cozinha` em duas abas. Ao concluir um
> pedido no totem, a cozinha atualiza sozinha (simulação de Realtime via
> `localStorage` + eventos do navegador).

---

## 🗂️ Estrutura de pastas

```
src/
├── assets/            # (reservado para imagens/estáticos)
├── components/
│   ├── ui/            # Button, QuantityStepper, Feedback (loading/empty/error)
│   ├── totem/         # Header, CategoryTabs, ProductCard, ProductModal, CartBar, CartItemRow
│   └── kitchen/       # KitchenCard
├── config/            # env.ts (fonte de dados), constants.ts (rotas, chaves, etc.)
├── contexts/          # CompanyContext (multiempresa: companyId + settings)
├── data/              # (reservado)
├── hooks/             # useAsync, useCatalog, useKitchenOrders
├── layouts/           # TotemLayout (modo totem, tela cheia)
├── mock/              # dados fictícios: companies, categories, products, orders, settings
├── pages/             # telas (Home, Menu, Product, Cart, Identification, Summary, Payment, OrderComplete, Kitchen, Admin)
├── routes/            # AppRoutes
├── services/          # camada de serviços (mock hoje, Supabase amanhã)
├── stores/            # Zustand: cartStore, sessionStore
├── styles/            # design system (global.css) + telas (screens.css)
├── types/             # modelos de domínio (futuras tabelas do Supabase)
└── utils/             # format, id, cart
```

---

## 🏛️ Como a arquitetura foi preparada para o futuro

- **Camada de serviços (`src/services`)** — a UI nunca importa dados
  mockados diretamente. Ela depende de **interfaces** (`services/types.ts`)
  e consome implementações via a fábrica em `services/index.ts`. Para
  plugar o Supabase, cria-se `*.supabase.ts` e troca-se a fábrica.
- **Multiempresa (`companyId`)** — todas as entidades têm `companyId`.
  O `CompanyContext` é o ponto único que define a empresa atual. Pronto
  para Supabase Auth + Row Level Security.
- **Estado desacoplado** — carrinho e sessão em stores Zustand com
  persistência em `localStorage`; regras de cálculo isoladas em `utils/`.
- **Pagamento abstraído** — a tela só chama `paymentService.process()`.
  Trocar o mock por uma maquininha/gateway não afeta a UI.
- **Impressão abstraída** — `printerService.printOrder()` (hoje imprime
  no console) preparado para impressora térmica.
- **KDS em tempo real** — `kitchenService.subscribe()` já entrega um
  modelo de assinatura, hoje simulando o Supabase Realtime.

📄 **Guia completo de integração:** [`docs/SUPABASE_INTEGRATION.md`](./docs/SUPABASE_INTEGRATION.md)

---

## 🔌 Trocar mocks por Supabase (resumo)

1. Preencha `.env.local` (veja `.env.example`) com `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` e `VITE_DATA_SOURCE=supabase`.
2. Implemente os serviços `*.supabase.ts` respeitando as interfaces.
3. Ative-os na fábrica `src/services/index.ts`.

Nenhuma tela precisa ser alterada.

---

## 🧱 Próximos passos para virar um SaaS

- Autenticação (Supabase Auth) + papéis (ADMIN, MANAGER, KITCHEN, CASHIER, TOTEM).
- Banco no Supabase + **RLS por `company_id`**.
- Painel administrativo (`/admin`) completo.
- Integração de pagamento real e impressora térmica.
- KDS via **Supabase Realtime**.
- Onboarding de empresas, planos e cobrança.

Detalhes em [`docs/SUPABASE_INTEGRATION.md`](./docs/SUPABASE_INTEGRATION.md).
