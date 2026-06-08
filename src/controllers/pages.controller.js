import { Cliente, ItemPedido, Pedido, Prato } from '../models/index.js';
import { criarErroHttp, criarId } from './controller.helpers.js';

/**
 * Monta o menu principal usado nas paginas EJS.
 */
function montarNavegacao() {
  return [
    { label: 'Dashboard', href: '/painel' },
    { label: 'Clientes', href: '/painel/clientes' },
    { label: 'Pratos', href: '/painel/pratos' },
    { label: 'Pedidos', href: '/painel/pedidos' },
    { label: 'Itens do Pedido', href: '/painel/itens-pedido' }
  ];
}

/**
 * Le uma mensagem simples da query string para mostrar feedback na tela.
 */
function lerFeedback(req) {
  if (req.query.success) {
    return { tipo: 'success', mensagem: req.query.success };
  }

  if (req.query.error) {
    return { tipo: 'error', mensagem: req.query.error };
  }

  return null;
}

/**
 * Cria um conjunto de dados comuns para todas as views do painel.
 */
function montarViewBase(req, pageTitle, currentPath) {
  return {
    pageTitle,
    currentPath,
    navegacao: montarNavegacao(),
    statusBanco: req.app.locals.statusBanco,
    feedback: lerFeedback(req)
  };
}

/**
 * Redireciona a pagina com uma mensagem de sucesso.
 */
function redirecionarComSucesso(res, caminho, mensagem) {
  return res.redirect(`${caminho}?success=${encodeURIComponent(mensagem)}`);
}

/**
 * Redireciona a pagina com uma mensagem de erro.
 */
function redirecionarComErro(res, caminho, mensagem) {
  return res.redirect(`${caminho}?error=${encodeURIComponent(mensagem)}`);
}

/**
 * Valida os dados do cliente enviados pelo formulario HTML.
 */
function extrairDadosCliente(body) {
  const nome = body.nome?.trim();
  const telefone = body.telefone?.trim() || null;

  if (!nome) {
    throw criarErroHttp('Informe o nome do cliente.');
  }

  return { nome, telefone };
}

/**
 * Valida os dados do prato enviados pelo formulario HTML.
 */
function extrairDadosPrato(body) {
  const nome = body.nome?.trim();
  const categoria = body.categoria?.trim() || null;
  const preco = Number(body.preco);

  if (!nome) {
    throw criarErroHttp('Informe o nome do prato.');
  }

  if (Number.isNaN(preco) || preco < 0) {
    throw criarErroHttp('Informe um preco valido para o prato.');
  }

  return { nome, categoria, preco };
}

/**
 * Valida o cliente opcional vinculado ao pedido.
 */
async function validarClienteDoPedido(idCliente) {
  if (!idCliente) {
    return null
  }

  const cliente = await Cliente.findByPk(idCliente)

  if (!cliente) {
    throw criarErroHttp('O cliente selecionado nao existe.')
  }

  return idCliente
}

/**
 * Valida o prato opcional vinculado ao pedido.
 */
async function validarPrato(idPrato) {
  if (!idPrato) {
    return null
  }

  const prato = await Prato.findByPk(idPrato)

  if (!prato) {
    throw criarErroHttp('O prato selecionado nao existe.')
  }

  return idPrato
}

/**
 * Valida os dados do pedido enviados pelo formulario HTML.
 */
async function extrairDadosPedido(body) {
  const mesa = Number(body.mesa);
  const status = body.status?.trim() || 'aberto';
  const idCliente = body.idCliente?.trim() || null;
  const idPrato = body.idPrato?.trim() || null;

  if (!Number.isInteger(mesa) || mesa <= 0) {
    throw criarErroHttp('Informe um numero de mesa valido.');
  }

  await validarClienteDoPedido(idCliente);
  await validarPrato(idPrato);

  return { mesa, status, idCliente, idPrato };
}

/**
 * Garante que o pedido e o prato existem antes de criar o item.
 */
async function extrairDadosItemPedido(body) {
  const quantidade = Number(body.quantidade);
  const idPedido = body.idPedido?.trim();
  const idPrato = body.idPrato?.trim();

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw criarErroHttp('Informe uma quantidade valida para o item.');
  }

  if (!idPedido) {
    throw criarErroHttp('Selecione um pedido.');
  }

  if (!idPrato) {
    throw criarErroHttp('Selecione um prato.');
  }

  const [pedido, prato] = await Promise.all([
    Pedido.findByPk(idPedido),
    Prato.findByPk(idPrato)
  ])

  if (!pedido) {
    throw criarErroHttp('O pedido selecionado nao existe.');
  }

  if (!prato) {
    throw criarErroHttp('O prato selecionado nao existe.');
  }

  return { quantidade, idPedido, idPrato };
}

/**
 * Renderiza o dashboard principal com um resumo das entidades.
 */
export async function mostrarDashboard(req, res, next) {
  try {
    const [clientes, pratos, pedidos, itensPedido] = await Promise.all([
      Cliente.findAll(),
      Prato.findAll(),
      Pedido.findAll({
        include: [
          { model: Cliente, as: 'cliente' },
          {
            model: ItemPedido,
            as: 'itens',
            include: [{ model: Prato, as: 'prato' }]
          }
        ]
      }),
      ItemPedido.findAll()
    ])

    return res.render('dashboard', {
      ...montarViewBase(req, 'Dashboard do Restaurante', req.originalUrl),
      resumo: {
        clientes: clientes.length,
        pratos: pratos.length,
        pedidos: pedidos.length,
        itensPedido: itensPedido.length
      },
      usuario: req.session.userId,
      pedidosRecentes: pedidos.slice(0, 5),
      pratosDestaque: pratos.slice(0, 5)
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Renderiza a pagina EJS com a lista de clientes.
 */
export async function mostrarPaginaClientes(req, res, next) {
  try {
    const clientes = await Cliente.findAll()

    return res.render('clientes', {
      ...montarViewBase(req, 'Clientes', req.originalUrl),
      clientes
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Renderiza a pagina EJS com a lista de pratos.
 */
export async function mostrarPaginaPratos(req, res, next) {
  try {
    const pratos = await Prato.findAll()

    return res.render('pratos', {
      ...montarViewBase(req, 'Pratos', req.originalUrl),
      pratos
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Renderiza a pagina EJS com a lista de pedidos.
 */
export async function mostrarPaginaPedidos(req, res, next) {
  try {
    const [pedidos, clientes, pratos] = await Promise.all([
      Pedido.findAll({
        include: [
          { model: Cliente, as: 'cliente' },
          {
            model: ItemPedido,
            as: 'itens',
            include: [{ model: Prato, as: 'prato' }]
          }
        ]
      }),
      Cliente.findAll(),
      Prato.findAll()
    ])

    return res.render('pedidos', {
      ...montarViewBase(req, 'Pedidos', req.originalUrl),
      pedidos,
      clientes,
      pratos
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Renderiza a pagina EJS com a lista de itens do pedido.
 */
export async function mostrarPaginaItensPedido(req, res, next) {
  try {
    const [itensPedido, pedidos, pratos] = await Promise.all([
      ItemPedido.findAll({
        include: [
          { model: Prato, as: 'prato' },
          { model: Pedido, as: 'pedido' }
        ]
      }),
      Pedido.findAll(),
      Prato.findAll()
    ])

    return res.render('itens-pedido', {
      ...montarViewBase(req, 'Itens do Pedido', req.originalUrl),
      itensPedido,
      pedidos,
      pratos
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Processa o cadastro de cliente enviado pela tela EJS.
 */
export async function cadastrarClientePelaPagina(req, res) {
  try {
    const dadosCliente = extrairDadosCliente(req.body)

    await Cliente.create({
      id: criarId(),
      ...dadosCliente
    })

    return redirecionarComSucesso(res, '/painel/clientes', 'Cliente cadastrado com sucesso.');
  } catch (error) {
    return redirecionarComErro(res, '/painel/clientes', error.message);
  }
}

/**
 * Processa o cadastro de prato enviado pela tela EJS.
 */
export async function cadastrarPratoPelaPagina(req, res) {
  try {
    const dadosPrato = extrairDadosPrato(req.body)

    await Prato.create({
      id: criarId(),
      ...dadosPrato
    })

    return redirecionarComSucesso(res, '/painel/pratos', 'Prato cadastrado com sucesso.');
  } catch (error) {
    return redirecionarComErro(res, '/painel/pratos', error.message);
  }
}

/**
 * Processa o cadastro de pedido enviado pela tela EJS.
 * Se idPrato for fornecido, cria automaticamente um item do pedido.
 */
export async function cadastrarPedidoPelaPagina(req, res) {
  try {
    const dadosPedido = await extrairDadosPedido(req.body)
    const { idPrato, ...dadosPedidoSemPrato } = dadosPedido

    const pedido = await Pedido.create({
      id: criarId(),
      ...dadosPedidoSemPrato
    })

    if (idPrato) {
      await ItemPedido.create({
        id: criarId(),
        idPedido: pedido.id,
        idPrato: idPrato,
        quantidade: 1
      })
    }

    return redirecionarComSucesso(res, '/painel/pedidos', 'Pedido cadastrado com sucesso.');
  } catch (error) {
    return redirecionarComErro(res, '/painel/pedidos', error.message);
  }
}

/**
 * Processa o cadastro de item do pedido enviado pela tela EJS.
 */
export async function cadastrarItemPedidoPelaPagina(req, res) {
  try {
    const dadosItemPedido = await extrairDadosItemPedido(req.body)

    await ItemPedido.create({
      id: criarId(),
      ...dadosItemPedido
    })

    return redirecionarComSucesso(
      res,
      '/painel/itens-pedido',
      'Item do pedido cadastrado com sucesso.'
    );
  } catch (error) {
    return redirecionarComErro(res, '/painel/itens-pedido', error.message);
  }
}
