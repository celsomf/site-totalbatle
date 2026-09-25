# CONTEXT — Total Battle Command Hub

Glossário canônico e definições de domínio do sistema.

## Domínio de Jogador e Perfis

### Jogador (Player)
Usuário do sistema que possui seu próprio conjunto de tropas, pesquisas de academia, níveis de capitães, dragão e herói.
- Cada jogador é identificado por um `playerName` (Nickname único ou identificador de exibição), `kingdom` (Reino, ex: `K:310`) e opcionalmente `clanTag` (ex: `[WAR]`).
- Os dados do jogador são isolados por `profileId` tanto no banco de dados relacional (PostgreSQL) quanto no armazenamento local do navegador (LocalStorage).

### Perfil do Jogador (Player Profile)
Entidade agregadora contendo:
- **Identificação**: `id`, `playerName`, `kingdom`, `clanTag`.
- **Cidade**: `capitolLevel`, `dragonLevel`, `maxMarchCapacity`, `mercenaryCapacity`, `specialCapacity`.
- **Herói**: `heroId` (Garvel ou Julia), `heroName`, `heroLevel`, `includeHero`.
- **Capitães**: `selectedCaptainIds`, `captainLevels` por capitão.
- **Inventário de Tropas**: `ownedTroopCounts` por unidade de tropa, `unlockedTroopIds`, `customTroopStats`.
- **Pesquisas**: `academyBonus` (% de ataque e saúde de Guardas, Especialistas e Monstros).

### Seletor de Perfil (Profile Selector)
Componente de navegação rápida presente no cabeçalho que permite ao usuário alternar entre diferentes perfis de jogadores, criar novos perfis zerados ou gerenciar perfis existentes.
