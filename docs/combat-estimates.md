# Estimativas aproximadas de combate

O cálculo usa cenários conservadores e prioriza vitória, preservação de monstros/mercenários por nível, preservação das tropas regulares por nível e quantidade enviada. Essa prioridade é qualitativa: não são atribuídos preços ou pesos monetários fictícios. Uma vitória calculada não é garantia de vitória ou teto de perdas no jogo.

## Evidência e critério aceito

Um caso observado e anonimizado enviou 2.703 unidades e perdeu 1.605 (59,38%). Com os atributos cadastrados, o modelo atual calcula 2.242 (82,94%). A previsão ficou 637 unidades, ou 39,69%, acima do real; equivalentemente, o real ficou 28,41% abaixo da previsão. O usuário aceitou esse exemplo como aproximação conservadora. Isso não estabelece tolerância percentual nem coeficiente global para outras batalhas.

O teste desse caso exige vitória observada, ordem dos cinco primeiros atacantes e alvos, dano inicial de 864.000 e baixas previstas entre as reais e o total enviado. Não exige igualdade exata por unidade. Os desvios permanecem registrados: primeiro golpe com 53 Dragões mortos no modelo contra 43 reais; 25 Gárgulas causam 509.600 contra 533.650 reais. A antiga previsão salva de 382 mortos não foi substituída nem confundida com o cálculo atual.

As regras de iniciativa e ordem foram conferidas em [The chance to attack first](https://scorewarrior.theymes.com/hc/en/total-battle/articles/the-chance-to-attack-first-220) e na transcrição do [vídeo oficial de combate](https://www.youtube.com/watch?v=8rdVjHNRXn0). O motor alterna lados, escolhe o grupo disponível de maior força atual e escolhe alvos pelo dano útil limitado à saúde restante. Aspectos usam a força-base separada dos demais bônus.

Continuam aproximados: atributos efetivos ainda não conferidos, bônus do dragão, desempates, dano parcial entre golpes, arredondamentos e sequências aleatórias. Avaliar duas aberturas fixas não cobre todas as sequências possíveis. O limite de simulação é de dez rodadas. Não se ajustaram constantes para reproduzir um único combate.

## Histórico e dados

Novas reservas guardam uma cópia independente dos atributos e bônus considerados, origem dos dados, versão do motor, inimigos e turnos. Uma versão diferente não recalcula silenciosamente uma previsão histórica. Registros antigos continuam compatíveis e identificados como incompletos. A porcentagem de perdas usa mortos previstos/unidades enviadas, sem contar capitão ou dragão.

O caso de teste publicado contém somente unidades, atributos e observações necessárias. Perfis, estoques completos, identificadores pessoais, relatórios brutos, imagens locais e cópias de recuperação ficam fora do Git. Nenhuma reserva ou alteração de estoque foi criada para validar a interface.

## Validação e escopo

A aplicação mantém o Caçador Épico VI com força 2.030, saúde 6.090, autoridade 1, bônus de 609% somente contra épicos e iniciativa 10 confirmada. Espião I e inventário não são duplicados. Berserker inimigo não é recrutável, o avatar do Javali foi corrigido e remover uma marcha devolve a reserva uma única vez.

As definições de bônus consumidas pelo simulador estão isoladas em combatCaptainDefinitions/combatCaptainStats. A refatoração de interface e dados gerais de Capitães/Herói já existente no diretório não faz parte desta publicação. Ela permanece intacta como trabalho local.

Outro caso do Inferno 15 continua divergindo na quantidade de dano, embora preveja derrota e todas as baixas do jogador. Sua exigência histórica de erro menor que 10% não foi relaxada para ocultar a divergência. Os dados usados por esse teste não incluem força-base separada e não substituem uma ficha efetiva comprovada. A mudança das regras piorou essa métrica quantitativa; ela é uma limitação conhecida, não foi atribuída às seis falhas preexistentes de Capitães e ROI e não motivou restaurar regras contrariadas pelo vídeo oficial.

Na cópia exata preparada para publicação, `npm run build` passou e a suíte completa teve **65 testes aprovados e 1 falha**, nessa precisão de dano do Inferno 15. As seis falhas da refatoração local anterior de Capitães/ROI não se reproduzem nessa cópia, pois aqueles arquivos ficaram fora do commit. O caso de Amaldiçoados passa no critério aproximado aceito; seus desvios numéricos continuam descritos acima. O aviso de pacote JavaScript acima de 500 kB permanece.
