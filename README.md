# API-Restaurante

API-Restaurante usando Node.js, Express, sqlite3 e arquitetura MVC.

## Estrutura

```text
src/
|- config/
|- controllers/
|- database/
|- models/
|- routes/
|- views/
`- app.js
```

## Entidades

- `clientes`
- `pratos`
- `pedidos`
- `itensPedido`

## Scripts

- `npm run dev`
- `npm start`

## Rotas principais

- `GET /status`
- `GET /clientes`
- `GET /pratos`
- `GET /pedidos`
- `GET /itens-pedido`

## Banco de dados

O script SQL base esta em `src/database/schema.sql`.
O arquivo SQLite padrao fica em `src/database/restaurante.sqlite`.

## Observacao

O projeto usa `sqlite3` com arquivo local do banco e SQL direto na camada de models.
