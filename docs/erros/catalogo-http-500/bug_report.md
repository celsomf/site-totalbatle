# Erro ao carregar o catálogo — HTTP 500

**Status:** PASS — serviço local iniciado e endpoints recuperados.

## Relato

- **Data/hora:** 25/09/2026, aproximadamente 17:27–17:29 (horário local).
- **Ambiente:** desenvolvimento local, frontend em `localhost:5173`.
- **Mensagem exibida:** `Falha ao carregar catálogo do banco (HTTP 500).`

## Classificação

Falha operacional local: o servidor da API não estava ativo na porta 3001. O frontend continuava ativo na porta 5173 e encaminhava `/api` para a API local.

## Evidências

1. Antes da correção, `http://localhost:3001/api/health` recusou conexão.
2. `http://localhost:5173/api/catalog` respondeu HTTP 500.
3. Ao executar `npm run server`, o processo informou conexão com PostgreSQL, inicialização das tabelas e escuta em `http://localhost:3001`.
4. Depois disso, `/api/health`, `/api/catalog` e o proxy `/api/catalog` do Vite responderam HTTP 200.

## Causa e correção

A API não estava em execução. O banco conectou normalmente e a inicialização do esquema terminou com sucesso; não foi necessário alterar código nem configuração. Iniciei a API com `npm run server`.

Para iniciar frontend e API juntos em uma nova sessão, use `npm run dev`. Se a página continuar mostrando o erro atual, clique em **Tentar novamente** ou atualize a página para carregar o catálogo novamente.

## Limitação

O servidor foi iniciado na sessão local atual. Se essa sessão for encerrada, a API para junto com ela.
