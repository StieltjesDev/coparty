# Coparty

SPA em Vue 3 com Vite para gerenciamento de eventos e decks.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`

## Ambiente

Configure `VITE_API_URL` no arquivo `.env`.

Exemplo:

`VITE_API_URL=http://localhost:3000/api`

## Estrutura

- `src/components`: interfaces atuais da aplicacao
- `src/services`: acesso HTTP por dominio
- `src/stores`: estado de sessao
- `src/constants`: opcoes reutilizaveis
- `src/validators`: regras de validacao reutilizaveis
