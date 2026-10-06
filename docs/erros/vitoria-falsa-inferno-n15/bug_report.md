# Falsa previsão de vitória: Tropa do Inferno Rara nível 15

## Relato e evidência

- Batalha de 25/09/2026, contra `Tropa do Inferno Rara (Nível 15)`.
- A simulação salva informou `VICTORY / COSTLY_VICTORY`, com 7.092.045 de dano e 1.018 baixas previstas.
- O jogo informou derrota. As 2.265 tropas enviadas morreram; nenhuma voltou.
- O relatório do jogo mostra baixas inimigas de 4.048 Demônios, 167 Demônios com Chifres e 42 Cérberos. Pelos HP catalogados, isso equivale a 2.842.752 de dano real, contra 6.382.800 HP iniciais.
- A primeira sequência de ataques do simulador causava 2.843.155 de dano, praticamente o valor do relatório. A estimativa de vitória dependia das rodadas seguintes.

## Causa

O simulador usava uma sequência fixa que favorecia uma abertura do jogador, escolhia o alvo inimigo pela classe do atacante e não reconhecia traits como `elemental`. Assim, estimava menos baixas do que ocorreram e deixava tropas capazes de atacar em rodadas posteriores.

## Correção

- Simular as duas possibilidades de primeira iniciativa e usar o resultado mais desfavorável quando os dados de iniciativa do jogador não estão cadastrados. A documentação oficial informa que, com iniciativas iguais, qualquer lado tem 50% de chance de começar: [The chance to attack first](https://scorewarrior.theymes.com/hc/en/total-battle/articles/the-chance-to-attack-first-220).
- Considerar os bônus contra a classe e os traits identificados do alvo, incluindo o bônus do Cérbero contra elementais.
- Ajustar a seleção de alvo da defesa para considerar o tamanho total do esquadrão e seus bônus recebidos.

## Validação

- Reprodução da composição histórica: `DEFEAT`, 2.265 baixas do jogador e dano previsto de 2.641.087. O HP restante estimado do inimigo fica a menos de 10% do valor calculado pelo relatório do jogo.
- `npx vitest run`: 20 testes aprovados.
- `npm run build`: aprovado. O Vite mantém o aviso não bloqueante de pacote JavaScript acima de 500 kB.

## Limitação

O histórico da aplicação preserva a previsão original da marcha. O teste usa as baixas visíveis na imagem do relatório; o jogo não forneceu, neste registro local, a ordem detalhada de cada ataque. A previsão corrigida é conservadora e deve ser comparada com novas batalhas antes de tratá-la como exata.
