# Bug report: elite isolado remove guardas de uma marcha perdedora

## Relato

A composição sugerida pode omitir os guardas quando a estimativa de dano dos monstros e mercenários ultrapassa a vida total do inimigo, mesmo que a simulação por turnos mostre que o inimigo elimina as tropas antes do ataque.

## Ambiente e evidência

- Ambiente: execução local no Windows/PowerShell, 2026-09-25.
- Reprodução sintética usando `buildDispatchedTroops` e `simulateCombat`.
- Um monstro enviado, ataque efetivo 179, aspecto de +1000% contra corpo a corpo; inimigo com 200 de vida e ataque 1000.
- Resultado observado: a marcha sugerida continha somente o monstro; a simulação resultou em `DEFEAT`, com o monstro perdido e dano do jogador igual a 0.

## Causa-raiz

`buildDispatchedTroops` decidia se podia dispensar guardas comparando dano estimado agregado com a vida total inimiga. Essa estimativa não considerava a ordem dos turnos nem as baixas sofridas antes de cada ataque.

## Correção

Decidir se as tropas de elite vencem sozinhas simulando esse grupo com a mesma ordem de turnos e aplicação de aspectos do combate normal. Só dispensar guardas se a simulação terminar em vitória.

## Critério de validação

- A reprodução sintética não deve classificar o grupo de elite como capaz de vencer sozinho.
- `npm run build` deve concluir sem erros de TypeScript.
- `tests/dynamic-dispatch.test.ts` deve continuar passando.

## Resultado após a correção

- A marcha inclui o arqueiro G2 disponível junto do monstro.
- A simulação termina em `VICTORY`; o arqueiro sobrevive.
- `tests/dynamic-dispatch.test.ts`: 3 testes aprovados.
- `npm run build`: concluído. O Vite exibiu o aviso não bloqueante de pacote JavaScript acima de 500 kB.

## Status

- Causa confirmada: `PASS`.
- Correção aplicada e reproduzida: `PASS`.
- Validação de compilação e despacho dinâmico: `PASS`.

## Problema encontrado no navegador: risco do aspecto inimigo ignorado na seleção

### Reprodução observada

- Alvo atual: `🍃 Tropa Élfica & Elemental Rara (Nível 2)`.
- A formação inimiga contém Centauros com `+50%` de força contra tropas de longo alcance.
- A marcha sugerida inclui tropas de longo alcance de alto valor, incluindo o Water Elemental, além de Arqueiros G1 marcados como bucha.
- A bucha G1 é uma unidade descartável para absorver baixas. O problema era o Water Elemental: o ranking considerava o dano que ele causa, mas não o bônus de dano que receberia dos Centauros.

### Causa e correção

O ranking de mercenários, monstros e tropas G2+ usava apenas o ataque esperado contra a formação inimiga. A pontuação agora desconta o multiplicador médio de dano recebido por classe, ponderado pelo ataque dos grupos inimigos. Assim, o bônus inimigo contra longo alcance reduz a prioridade de tropas ranged de alto valor; os aspectos ofensivos próprios continuam sendo ponderados pelo HP das classes inimigas.

Também foram removidas regras incompletas que simplesmente excluíam algumas classes ou as rebaixavam com comparadores inconsistentes. Depois da primeira composição, uma segunda etapa testa cada tropa, inclusive a bucha G1, no simulador. Ela remove ou reduz tropas que não ajudam a vitória nem evitam baixas.

### Resultado da validação

- `npm run build`: `PASS`.
- `npx vitest run tests/dynamic-dispatch.test.ts`: `PASS`, 3 testes aprovados.
- Reprodução sintética: com um monstro ranged de ataque 2.100 contra um Centauro com +100% contra ranged, a alternativa voadora de ataque 1.500 foi priorizada (`PASS`).
- Recalculo final com o perfil Araning e a formação real: Water Elemental `31 → 0`, Atirador Veloz `54 → 2`, Arqueiro I `200 → 0` e Lanceiro I `150 → 1`.
- A tela da aplicação, após selecionar o alvo e recalcular, confirma que não lista Water Elemental nem Arqueiro I. Resultado: `VICTORY / PROTECTED_VICTORY`; a simulação prevê 1 Lanceiro I perdido.
- Os 2 Atiradores Velozes restantes eliminam os Arqueiros Élficos antes do contra-ataque, segundo a ordem de turnos simulada. Reduzir para 1 perde um Atirador; reduzir para 0 perde um Dragão Esmeralda.
- Vite mantém o aviso não bloqueante de pacote JavaScript acima de 500 kB.
