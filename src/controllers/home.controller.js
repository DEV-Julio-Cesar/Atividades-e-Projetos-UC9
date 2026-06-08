/**
 * Renderiza uma página simples de status quando o banco ainda não estiver disponível.
 */
export function mostrarInicio(req, res) {
  const statusBanco = req.app.locals.statusBanco;

  res.render('index', {
    title: 'API-Restaurante',
    message: 'O painel dinâmico depende do banco conectado. Quando o banco estiver disponível, use o dashboard EJS.',
    statusBanco,
    endpoints: [
      'GET /status',
      'GET /painel',
      'GET /painel/clientes',
      'GET /painel/pratos',
      'GET /painel/pedidos',
      'GET /painel/itens-pedido'
    ]
  });
}

/**
 * Retorna o status atual da API e da conexão com o banco de dados.
 */
export function mostrarStatus(req, res) {
  res.json({
    api: 'online',
    banco: req.app.locals.statusBanco
  });
}
