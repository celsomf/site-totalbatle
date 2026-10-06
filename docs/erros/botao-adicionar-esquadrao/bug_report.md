# Botão para adicionar esquadrão inimigo não inclui uma nova linha

**Status:** PASS — correção aplicada e compilação de produção concluída; a reprodução manual ficou bloqueada pela API local indisponível.

## Relato

- **Data/hora:** 25/09/2026, aproximadamente 19:03 (horário de Brasília).
- **Ambiente:** interface web; ambiente de execução não informado.
- **Sintoma observado:** ao clicar em “Adicionar Novo Esquadrão Inimigo”, a formação não recebe uma nova linha e aparece a mensagem de que “Cavalgante de Lobo já está nesta formação”.

## Classificação

Falha de lógica na interface do modal de edição. A imagem mostra uma mensagem de duplicidade, portanto o clique é tratado; a rotina interrompe a inclusão antes de acrescentar o esquadrão.

## Evidências

1. `handleAddSquad` escolhia sempre o primeiro monstro do catálogo (`monsters[0]`).
2. Quando esse monstro já aparecia na formação, a verificação de duplicidade encerrava a rotina sem atualizar a lista.
3. A mensagem de duplicidade na captura corresponde a esse caminho.
4. Após a correção, `npm run build` concluiu com sucesso: TypeScript e bundle de produção foram gerados.

## Causa e critério da correção

A inclusão usava um monstro fixo, já presente na formação. A correção deve selecionar o primeiro monstro do catálogo ainda não usado e acrescentá-lo; se o catálogo inteiro já estiver representado, deve informar claramente por que não é possível adicionar outra linha.

## Validação

Critério observável: com “Cavalgante de Lobo” já na formação, o código seleciona outro monstro disponível, acrescenta a linha e limpa a mensagem antiga. `npm run build` concluiu sem erros. A interface não foi aberta para uma reprodução manual nesta sessão.

## Limitação

A página do frontend respondeu HTTP 200 na porta 5173, mas a API local na porta 3001 estava indisponível. Como o catálogo do banco é necessário para abrir e preencher o modal, não foi possível confirmar o clique manualmente. O build também exibiu o aviso do Vite sobre o bundle JavaScript acima de 500 kB; isso não impediu a geração.
