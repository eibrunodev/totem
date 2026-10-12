# 🔧 Guia de Integração — de Mock para Supabase (e SaaS)

Este documento explica **como o MVP funciona hoje com mocks** e **onde/como
plugar o Supabase**, pagamentos reais, impressão térmica, KDS em tempo real e
o modelo multiempresa (SaaS). A regra de ouro do projeto: **as telas não
mudam** — só trocamos a implementação da camada de serviços.

---

## 1. Como os mocks funcionam

Os dados fictícios vivem em `src/mock/` (empresas, categorias, produtos,
pedidos, configurações). Eles **não são importados pelas telas**. Quem os
serve é a **camada de serviços** (`src/services`), que expõe funções
assíncronas (retornam `Promise`) para simular latência de rede.

Fluxo de dependências:

```
Componentes/Páginas ──► hooks (useCatalog, useKitchenOrders)
                          │
                          ▼
                 services/index.ts  (fábrica: escolhe mock ou supabase)
                          │
        ┌─────────────────┴──────────────────┐
        ▼                                     ▼
  *.mock.ts  (hoje)                    *.supabase.ts  (futuro)
        │
        ▼
  mockStore.ts  (memória + localStorage + eventos = "banco" fake)
```

- **Persistência**: `mockStore` guarda pedidos e pedidos de cozinha no
  `localStorage` e emite eventos de mudança.
- **"Realtime" simulado**: `kitchenService.subscribe()` escuta o `mockStore`
  e o evento `storage` do navegador → quando o totem cria um pedido, a aba da
  cozinha (`/cozinha`) atualiza sozinha, inclusive em outra aba/dispositivo do
  mesmo navegador.
- **Contratos**: `src/services/types.ts` define as **interfaces** que qualquer
  implementação (mock ou real) precisa respeitar.

---

## 2. Onde conectar o Supabase

Três pontos, nenhum deles em componentes:

1. **`.env.local`** (copie de `.env.example`):
   ```env
   VITE_DATA_SOURCE=supabase
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_DEFAULT_COMPANY_ID=company-001
   ```

2. **Cliente Supabase** — crie `src/services/supabaseClient.ts`:
   ```ts
   import { createClient } from '@supabase/supabase-js';
   import { env } from '@/config/env';

   export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
   ```
   (Instale: `npm i @supabase/supabase-js`)

3. **Implemente os serviços** `*.supabase.ts` respeitando `services/types.ts`
   e **ative-os na fábrica** `src/services/index.ts`. Exemplo:
   ```ts
   export const productService: IProductService = isMockMode
     ? mockProductService
     : supabaseProductService;
   ```

Exemplo de um serviço real (`src/services/productService.supabase.ts`):

```ts
import type { IProductService } from './types';
import { supabase } from './supabaseClient';

export const supabaseProductService: IProductService = {
  async getCategories(companyId) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('company_id', companyId)     // RLS reforça isso no servidor
      .eq('active', true)
      .order('sort_order');
    if (error) throw error;
    return data ?? [];
  },
  async getProducts(companyId) {
    const { data, error } = await supabase
      .from('products')
      .select('*, addons:product_addons(*)')
      .eq('company_id', companyId);
    if (error) throw error;
    return data ?? [];
  },
  async getProductById(companyId, id) {
    const { data, error } = await supabase
      .from('products')
      .select('*, addons:product_addons(*)')
      .eq('company_id', companyId)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};
```

> Dica: os campos do banco em `snake_case` podem ser mapeados para o
> `camelCase` dos types com uma pequena função de adaptação, ou usando
> `select` com alias.

---

## 3. Quais tabelas deverão existir

Os modelos em `src/types/index.ts` são o espelho das tabelas. Esquema SQL
sugerido (Postgres/Supabase):

```sql
-- Empresas (tenants)
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo text,
  primary_color text default '#f97316',
  currency text default 'BRL',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Usuários da operação (vinculados ao auth.users do Supabase)
create table users (
  id uuid primary key references auth.users(id),
  company_id uuid not null references companies(id),
  name text not null,
  email text not null,
  role text not null check (role in ('ADMIN','MANAGER','KITCHEN','CASHIER','TOTEM')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  name text not null,
  icon text,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  category_id uuid not null references categories(id),
  name text not null,
  description text,
  price numeric(10,2) not null,
  image text,
  available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table product_addons (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  product_id uuid references products(id),   -- ou uma tabela de vínculo N:N
  name text not null,
  price numeric(10,2) not null
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  number int not null,
  customer_name text,
  subtotal numeric(10,2) not null,
  service_fee numeric(10,2) default 0,
  total numeric(10,2) not null,
  payment_method text check (payment_method in ('PIX','DEBIT','CREDIT')),
  payment_status text not null default 'PENDING',
  order_status text not null default 'CREATED',
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  name text not null,          -- snapshot
  unit_price numeric(10,2) not null,
  quantity int not null,
  selected_addons jsonb default '[]',
  line_total numeric(10,2) not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  order_id uuid not null references orders(id),
  method text not null,
  status text not null,
  amount numeric(10,2) not null,
  external_ref text,
  created_at timestamptz default now()
);

create table kitchen_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  order_id uuid not null references orders(id),
  number int not null,
  customer_name text,
  total numeric(10,2) not null,
  status text not null default 'NEW' check (status in ('NEW','IN_PROGRESS','READY','DONE')),
  created_at timestamptz default now(),
  accepted_at timestamptz,
  ready_at timestamptz,
  done_at timestamptz
);

create table printers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  name text not null,
  target text,          -- 'kitchen', 'cashier'...
  connection text,
  active boolean default true
);

create table settings (
  company_id uuid primary key references companies(id),
  service_fee_rate numeric(4,3) default 0,
  next_order_number int default 1024,
  ask_customer_name boolean default true,
  enabled_payment_methods text[] default array['PIX','DEBIT','CREDIT']
);
```

> O **número do pedido** pode migrar de contador local para uma `sequence`
> por empresa, ou um `next_order_number` transacional em `settings`.

---

## 4. Como implementar autenticação (Supabase Auth)

- Habilite **Email/Senha** (ou magic link/OAuth) no painel do Supabase.
- Login do operador:
  ```ts
  await supabase.auth.signInWithPassword({ email, password });
  ```
- Após login, carregue o `users.company_id` e o `role` do usuário logado e
  disponibilize no `CompanyContext`/um `AuthContext`.
- **Totem**: normalmente roda com um usuário técnico de papel `TOTEM` (ou
  uma sessão anônima restrita), enquanto **cozinha** usa papel `KITCHEN` e o
  **admin** usa `ADMIN`/`MANAGER`.

---

## 5. Como implementar multiempresa

Já está preparado no código:

- Todas as entidades carregam `companyId`.
- `CompanyContext` define a empresa atual (hoje via env; amanhã via usuário
  logado, subdomínio `empresa.totemfood.app`, ou parâmetro do totem).
- Os serviços recebem `companyId` e filtram por ele.

No Supabase, o isolamento é **reforçado no servidor** por RLS (próxima seção),
para que nenhuma empresa acesse dados de outra mesmo que o front seja adulterado.

---

## 6. Como implementar RLS (Row Level Security)

Ative RLS em cada tabela e crie políticas baseadas em `company_id`. Padrão
recomendado: guardar o `company_id` do usuário no JWT (via custom claims) ou
consultar a tabela `users`.

```sql
alter table products enable row level security;

-- Função utilitária: company_id do usuário autenticado
create or replace function auth_company_id() returns uuid as $$
  select company_id from public.users where id = auth.uid();
$$ language sql stable;

-- Leitura/escrita restrita à empresa do usuário
create policy "produtos da própria empresa"
  on products for all
  using (company_id = auth_company_id())
  with check (company_id = auth_company_id());
```

Repita para `categories`, `orders`, `order_items`, `payments`,
`kitchen_orders`, `settings`, `printers`. Para o **totem anônimo**, é comum
expor apenas **leitura** de `categories`/`products` da empresa via uma policy
específica (ou uma view pública por `slug`), e criar pedidos via uma **Edge
Function** que valida o tenant.

---

## 7. Como implementar Supabase Realtime (KDS)

Hoje `kitchenService.subscribe()` usa o `mockStore`. A versão real:

```ts
// src/services/kitchenService.supabase.ts
subscribe(companyId, cb) {
  // 1) carga inicial
  this.getOrders(companyId).then(cb);

  // 2) mudanças em tempo real
  const channel = supabase
    .channel(`kitchen:${companyId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'kitchen_orders', filter: `company_id=eq.${companyId}` },
      () => this.getOrders(companyId).then(cb)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
```

O hook `useKitchenOrders` e a tela `/cozinha` **não mudam**.

---

## 8. Como substituir o pagamento mockado

A UI só conhece `paymentService.process()` e reage ao `PaymentResult`
(`approved` / `DECLINED`). Para integrar de verdade:

- **Maquininha (Pinpad/SmartPOS)**: crie `RealPaymentService.process()` que
  fala com o SDK da maquininha (ex.: Stone, Cielo LIO, PagSeguro Moderninha,
  Mercado Pago Point) — geralmente via app nativo/Android + ponte.
- **Gateway/PIX**: chame uma **Edge Function** do Supabase que cria a cobrança
  no PSP (ex.: Mercado Pago, Asaas, Pagar.me) e faça _polling_ ou webhook para
  confirmar. Grave o resultado em `payments` e atualize `orders.payment_status`.
- Em caso de recusa, retorne `approved: false` — a tela de pagamento já trata
  esse caminho (permite tentar outra forma).

Somente `paymentService.process` muda; nenhuma tela é afetada.

---

## 9. Como implementar impressão térmica

`printerService.printOrder()` hoje escreve um comprovante no console.
Opções de implementação real:

- **Backend → impressora de rede (ESC/POS)**: uma Edge Function/servidor
  recebe o pedido e envia os comandos ESC/POS por TCP para a impressora da
  cozinha (IP fixo). Fluxo: `Totem → Pagamento aprovado → API → impressora`.
- **Impressão local (mesmo dispositivo)**: **QZ Tray** ou **WebUSB** para
  impressoras conectadas ao próprio equipamento.
- **App da impressora/fabricante**: SDKs Android para SmartPOS.

Mantenha a assinatura `printOrder(order)` — o disparo já acontece no momento
certo (logo após o pagamento aprovado, em `PaymentPage`).

---

## 10. Como conectar o KDS

O KDS (`/cozinha`) consome `kitchenService`. Ao migrar para Supabase:

1. `markPaid()` (em `orderService`) faz `INSERT` em `kitchen_orders` (ou uma
   trigger no banco cria o registro quando `orders.order_status = 'PAID'`).
2. A tela da cozinha assina `kitchen_orders` via Realtime (seção 7).
3. Os botões **Aceitar / Marcar pronto / Finalizar** fazem `UPDATE` no
   `status` + timestamps (`kitchenService.updateStatus`).

Como o KDS é uma rota independente (`/cozinha`), pode rodar em outro
computador/tablet da mesma conta, apontando para a mesma empresa.

---

## 11. Como transformar o projeto em SaaS

1. **Auth + tenancy**: login por empresa, `company_id` no JWT, RLS em tudo.
2. **Onboarding**: cadastro de empresa (cria `companies` + `settings` + usuário
   ADMIN), escolha de identidade visual (a `primary_color` já é aplicada em
   runtime pelo `CompanyContext` → white-label).
3. **Painel administrativo** (`/admin`, já roteado): CRUD de produtos,
   categorias, configurações, pagamentos, impressoras, usuários, relatórios.
4. **Planos e cobrança**: integração com um PSP/assinatura; limites por plano.
5. **Deploy multi-totem**: cada totem abre `/` da empresa (via subdomínio ou
   parâmetro), o KDS abre `/cozinha`, o caixa/admin abre `/admin`.
6. **Observabilidade**: logs de pedidos, métricas de conversão do totem,
   tempo de preparo (os timestamps do `kitchen_orders` já suportam isso).

---

## Papéis e permissões previstos

| Papel | Acesso |
|-------|--------|
| `ADMIN` | Tudo da empresa (config, usuários, relatórios) |
| `MANAGER` | Operação e relatórios, sem gestão de usuários |
| `KITCHEN` | Apenas o KDS (`/cozinha`) |
| `CASHIER` | Caixa / acompanhamento de pedidos |
| `TOTEM` | Apenas o fluxo de pedido do totem |

Esses papéis viram políticas de RLS e/ou verificações de rota no front
(um `ProtectedRoute` por `role`).
