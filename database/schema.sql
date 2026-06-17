PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT
);

CREATE TABLE IF NOT EXISTS pratos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  preco REAL NOT NULL,
  categoria TEXT
);

CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,
  mesa INTEGER NOT NULL,
  status TEXT,
  idCliente TEXT,
  FOREIGN KEY (idCliente) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS itensPedido (
  id TEXT PRIMARY KEY,
  quantidade INTEGER NOT NULL,
  idPedido TEXT,
  idPrato TEXT,
  FOREIGN KEY (idPedido) REFERENCES pedidos(id),
  FOREIGN KEY (idPrato) REFERENCES pratos(id)
);
