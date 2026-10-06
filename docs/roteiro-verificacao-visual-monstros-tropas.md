# Roteiro visual para conferir monstros e tropas

Este documento registra o procedimento observado no jogo oficial Total Battle para futuramente criar uma skill que confira monstros, seus níveis, fichas das unidades e composições no catálogo do projeto.

## Objetivo

Quando um monstro ou grupo aparecer no mapa do jogo, identificar o alvo e o nível, conferir visualmente quais unidades compõem o grupo e garantir que essas unidades estejam pesquisáveis no catálogo do sistema. Quando o alvo e nível correspondentes existirem no catálogo, registrar também a composição confirmada naquele nível.

## Procedimento observado

1. Antes de abrir fichas ou composições no jogo, consultar o banco. Listar os modelos de alvo, níveis disponíveis, formações já salvas e unidades do catálogo. Marcar os níveis que já têm formação completa para não investigar nem duplicar esses grupos.
2. No mapa, clicar somente o necessário para ler o nome, a raridade/tipo, o nível e as coordenadas do alvo. Procurar essa combinação no resultado da conferência inicial, relacionando família, raridade e nível; o nome interno pode ser diferente do nome do jogo.
3. Se o nível já tiver uma composição cadastrada, não clicar em **Atacar** para esse grupo nem alterar seus dados. Se o nível estiver vazio e houver um modelo correspondente, conferir se as unidades citadas pelo catálogo já existem antes de abrir fichas no jogo.
4. No diálogo de um nível que falta, clicar em **Atacar** para abrir a tela de preparação e revelar o painel **Tropas inimigas no destino da marcha**.
5. Ler cada cartão e anotar o nome da unidade, o tier indicado e a quantidade. Comparar nome e tier com as unidades já cadastradas; reutilizar cada registro cuja identidade corresponda, sem criar duplicatas.
6. Abrir a ficha visual somente para uma unidade que não exista no catálogo ou cuja identidade/dados não possam ser confirmados. Se o primeiro clique não abrir a ficha, repetir uma vez e confirmar pela tela. Registrar nome, família, classe/subtipo, tier, força, saúde, liderança, iniciativa e aspectos/bônus exibidos.
7. Se a unidade ainda não existir, cadastrá-la uma única vez em `monster_units`, usando os valores confirmados na ficha, imagem própria quando disponível e campos de imagem nulos quando não houver arquivo correspondente. Usar transação, parâmetros SQL e o caminho seguro descrito em `.agents/skills/adicionar-monstro/SKILL.md`.
8. Antes de salvar a composição, consultar novamente as linhas daquele alvo e nível. Salvar em `monster_formation_units` somente se o nível correto estiver vazio e todos os IDs existirem. Se já houver uma formação igual, não duplicar; se houver formação diferente, parar e revisar antes de substituir.
9. Conferir o resultado lendo os registros no PostgreSQL e consultando `GET /api/catalog`. Confirmar que as unidades aparecem no catálogo e que a composição está associada ao alvo e nível corretos.

## Limite para evitar uma marcha no jogo

O botão **Atacar** foi usado somente para abrir a tela de preparação e consultar as tropas inimigas. Não clicar em **Iniciar marcha** durante a coleta: esse botão envia o exército. Só prosseguir com a marcha se o usuário pedir explicitamente.

## Exemplo conferido visualmente

Alvo visto no mapa: **Tropa de Elfos Rara**, nível **2**, coordenadas `K:310 X:924 Y:252`.

Composição exibida no painel de tropas inimigas:

| Unidade | Tier | Quantidade |
| --- | ---: | ---: |
| Centauro | III | 3 |
| Arqueiro Élfico | I | 7 |
| Anão | I | 14 |

Fichas abertas no jogo:

| Unidade | Família e classe | Força | Saúde | Liderança | Iniciativa | Aspectos vistos |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Centauro | Elfos, unidade montada | 2.600 | 7.800 | 16 | 10 | +50% contra unidades de longo alcance; +20% contra armas de cerco |
| Arqueiro Élfico | Elfos, unidade de longo alcance | 100 | 300 | 2 | 10 | +35% contra unidades corpo a corpo |
| Anão | Elfos, unidade corpo a corpo | 28 | 84 | 1 | 10 | +10% contra unidades montadas |

Correspondência confirmada no catálogo do projeto: `tropa_elfos_rara`, nome interno **Tropa Élfica & Elemental Rara**, família de vigia **Elfos**, nível `tropa_elfos_rara_lvl_2`. Os registros individuais `centauro`, `arqueiro_elfico` e `anao` já existiam no banco e seus atributos conferiam com as fichas. A composição desse nível foi registrada como Centauro ×3, Arqueiro Élfico ×7 e Anão ×14.

## Limitações observadas

- A tela de preparação mostra unidades e quantidades; os atributos detalhados exigem abrir a ficha de cada unidade.
- O primeiro clique no cartão nem sempre abriu a ficha; foi preciso tentar de novo e conferir visualmente que o nome da ficha correspondia ao cartão.
- Não inferir uma unidade, bônus, imagem ou vínculo de alvo apenas pelo nome. Quando a ficha ou a correspondência forem inconclusivas, registrar a dúvida e não gravar dados supostos.
