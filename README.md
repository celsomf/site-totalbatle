# ⚔️ Total Battle Combat & March Advisor

> **Assistente Tático e Calculadora Avançada de Combate, Criptas e Otimização de Marchas para o jogo [Total Battle](https://totalbattle.com/).**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0+-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 📖 Visão Geral

O **Total Battle Advisor** é uma ferramenta analítica desenvolvida para jogadores que buscam maximizar o retorno de pontos de valor (VP), pontos de baú, experiência de capitães e taxa de sobrevivência em ataques contra **Monstros Épicos, Monstros Comuns, Criptas de Recursos e Fortificações**.

A aplicação simula fielmente as regras reais de combate do Total Battle, aplicando a técnica de **Pilhas de Sacrifício (Fodder Absorption)** nos 9 slots de tropa para proteger os monstros pesados e tropas de alto dano contra os ataques mais devastadores do inimigo.

---

## ✨ Principais Funcionalidades

### 1. 📜 Livro de Marcha Oficial
- Visualização do formato clássico de 9 esquadrões (Grid $3 \times 3$) idêntico à interface de marcha do jogo.
- Alocação automática e precisa da quantidade de cada soldado a enviar com 1 clique.
- Monitoramento de capacidade máxima do exército, limite de mercenários e limite especial.

### 2. ⚔️ Calculadora de Combate & Simulação de Dano
- Cálculo exato de probabilidade de vitória, rodadas estimadas e projeção de perdas.
- Estimativa de Pontos de Valor, Pontos de Baú e XP do Capitão.
- Cálculo dos custos de reviver no Templo em Prata (Defesa) e Ouro (Ataque).

### 3. 🧭 Explorador e Otimizador de Criptas
- Análise de *One-Shot* para criptas de níveis 5 a 35+.
- Cálculo do custo real de Piche (Tar) com reduções de capitães (ex: Aydae).
- Projeção de materiais de forja raros obtidos por investida.

### 4. 📚 Enciclopédia de Tropas & Otimizador de Combinações
- Catálogo de todas as classes do jogo: **Guardas (G1 ao G9 / P1-P2), Especialistas (S1 ao S5), Monstros/Elementais e Mercenários**.
- Detalhamento de **Aspectos Nativos de Combate** (ex: *+763% contra Voadores, +888% contra Cavalaria, +1367% contra Feras*).
- **Simulador de Combinações Ideais:** sugere as melhores tropas por ponto de liderança contra o tipo de alvo selecionado.

### 5. 🛡️ Liderança de Marcha Modular (1 Herói + 3 Capitães)
- Suporte aos Heróis iniciais (**Garvel** e **Julia**) com nível configurável.
- Seleção de até **3 Capitães simultâneos** com somatório real de bônus e elenco recolhível (acordeom).

### 6. 💾 Persistência Dupla (PostgreSQL 17 + LocalStorage)
- Servidor de API backend com banco **PostgreSQL 17 local** (`localhost:5432`).
- Criação e migração automática de tabelas (`player_profiles`, `captain_levels`, `troop_inventory`, `custom_troops`).
- Fallback automático e instantâneo com cache local no navegador.

---

## 🏛️ Arquitetura do Projeto

```
site-totalbatle/
├── public/
│   └── assets/
│       └── troops/          # Retratos oficiais das unidades e capitães (.png)
├── server/
│   ├── db.ts                # Conexão e pooling PostgreSQL 17 + schema DDL
│   └── index.ts             # API REST Express (Health check e CRUD de Perfil)
├── src/
│   ├── components/          # Componentes visuais React (UI Total Battle Fantasy)
│   │   ├── AddTroopModal.tsx        # Modal de recrutamento dinâmico
│   │   ├── CaptainSelector.tsx      # Seletor com acordeom e heróis
│   │   ├── CryptOptimizer.tsx       # Otimizador de criptas
│   │   ├── Header.tsx               # Status de conexão do PostgreSQL
│   │   ├── MarchBookView.tsx        # Livro de marcha visual
│   │   ├── MarchResultCard.tsx      # Resumo tático do combate
│   │   ├── MonsterSelector.tsx      # Seletor de monstros e alvos
│   │   ├── ProfileConfig.tsx        # Configurações da cidade e academia
│   │   ├── TroopAvatar.tsx          # Renderizador de avatares com fallback SVG
│   │   ├── TroopCustomizer.tsx      # Quartel e gerenciamento de estoque
│   │   ├── TroopDetailModal.tsx     # Ficha técnica oficial da unidade
│   │   └── TroopEncyclopedia.tsx   # Enciclopédia & Otimizador de combinações
│   ├── data/                # Catálogo oficial de tropas, monstros e capitães
│   │   ├── captains.ts
│   │   ├── monsters.ts
│   │   └── troops.ts
│   ├── engine/              # Motores matemáticos de combate e empilhamento
│   │   ├── combat.ts        # Algoritmo de rodadas e dano
│   │   ├── crypt.ts         # Cálculo de piche e materiais
│   │   └── stacking.ts      # Distribuição dos 9 esquadrões de sacrifício
│   ├── hooks/               # Custom hooks (Sincronização de perfil e banco)
│   ├── services/            # Cliente HTTP para a API local
│   ├── types/               # Tipagens TypeScript completas
│   ├── App.tsx              # Roteamento e layout principal
│   └── main.tsx             # Bootstrap da aplicação
├── tests/                   # Testes unitários com Vitest
└── package.json             # Scripts de build e dependências
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- [PostgreSQL 17](https://www.postgresql.org/download/) (Opcional — a aplicação funciona via LocalStorage caso o banco não esteja rodando).

### 1. Clonar o Repositório
```bash
git clone https://github.com/celsomf/site-totalbatle.git
cd site-totalbatle
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Configurar o Banco de Dados (PostgreSQL 17)
Crie um banco de dados local ou utilize o banco padrão `postgres`:
```sql
CREATE DATABASE total_battle_db;
```
As variáveis de ambiente padrão conectam em `postgresql://postgres:postgres@localhost:5432/postgres` (ajustável via `server/db.ts` ou `.env`).

### 4. Iniciar a Aplicação em Modo Desenvolvimento
O comando inicia simultaneamente o servidor backend Express na porta `3001` e o frontend Vite na porta `5173`:
```bash
npm run dev
```
Acesse no navegador: **`http://localhost:5173`**

---

## 🧪 Testes Automatizados & Build

Para rodar a suíte de testes de combate, empilhamento e cálculos de cripta:
```bash
npm test
```

Para validar a tipagem TypeScript e gerar o pacote de produção otimizado:
```bash
npm run build
```

---

## 📐 Fórmulas e Regras de Combate

### 1. Bônus Efetivo de Tropa
$$\text{Força Efetiva} = \text{Força Base} \times \left(1 + \frac{\text{Bônus Academia} + \text{Bônus Capitão}}{100}\right) \times (1 + \text{Multiplicador de Aspecto})$$

### 2. Pilha de Absorção (Bucha de Sacrifício)
- O motor de alocação divide as tropas de menor custo em pequenos esquadrões nas posições dianteiras para absorver 100% do dano de um ataque unitário, preservando as pilhas pesadas de dano para o contra-ataque.

---

## 🤝 Padrão de Contribuição & Git Flow

Siga as boas práticas de desenvolvimento:
1. Crie uma branch para sua feature: `git checkout -b feat/nome-da-feature`
2. Mantenha os commits no padrão **Conventional Commits**:
   - `feat:` Nova funcionalidade
   - `fix:` Correção de bug
   - `refactor:` Refatoração de código
   - `docs:` Alterações na documentação
   - `test:` Adição ou ajuste de testes
3. Garanta que `npm test` e `npm run build` passem sem erros antes de submeter um Pull Request.

---

## 📜 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para obter mais informações.

