import { Cliente, ItemPedido, Pedido, Prato } from '../models/index.js';
import {
  criarErroHttp,
  criarId,
  responderErro,
  responderNaoEncontrado
} from './controller.helpers.js';

/**
 * Valida se o cliente informado existe antes de salvar o pedido.
 */
async function validarClienteDoPedido(idCliente) {
  if (!idCliente) {
    return null
  }

  const cliente = await Cliente.findByPk(idCliente)

  if (!cliente) {
    throw criarErroHttp('O cliente informado nao existe.')
  }

  return idCliente
}

/**
 * Valida se o prato informado existe.
 */
async function validarPrato(idPrato) {
  if (!idPrato) {
    return null
  }

  const prato = await Prato.findByPk(idPrato)

  if (!prato) {
    throw criarErroHttp('O prato informado nao existe.')
  }

  return idPrato
}

/**
 * Organiza e valida os dados completos do pedido.
 * Esse helper e usado no POST e no PUT.
 */
async function extrairDadosPedido(body) {
  const mesa = Number(body.mesa);
  const status = body.status?.trim() || 'aberto';
  const idCliente = body.idCliente?.trim() || null;
  const idPrato = body.idPrato?.trim() || null;

  if (!Number.isInteger(mesa) || mesa <= 0) {
    throw criarErroHttp('O campo mesa deve ser um numero inteiro maior que zero.');
  }

  await validarClienteDoPedido(idCliente);
  await validarPrato(idPrato);

  return { mesa, status, idCliente, idPrato };
}

/**
 * Organiza e valida os dados parciais do pedido.
 * Esse helper e usado no PATCH.
 */
async function extrairDadosPedidoParcial(body) {
  const dadosPedido = {};

  if (body.mesa !== undefined) {
    const mesa = Number(body.mesa);

    if (!Number.isInteger(mesa) || mesa <= 0) {
      throw criarErroHttp('O campo mesa deve ser um numero inteiro maior que zero.');
    }

    dadosPedido.mesa = mesa;
  }

  if (body.status !== undefined) {
    dadosPedido.status = body.status?.trim() || 'aberto';
  }

  if (body.idCliente !== undefined) {
    const idCliente = body.idCliente?.trim() || null;
    await validarClienteDoPedido(idCliente);
    dadosPedido.idCliente = idCliente;
  }

  if (Object.keys(dadosPedido).length === 0) {
    throw criarErroHttp('Envie pelo menos um campo para atualizar no PATCH.');
  }

  return dadosPedido;
}

/**
 * Metodo GET
 * Lista todos os pedidos com cliente e itens do pedido.
 */
export async function listarPedidos(req, res) {
  try {
    const pedidos = await Pedido.findAll()

    return res.json(pedidos)
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo GET
 * Busca um pedido especifico com seus relacionamentos.
 */
export async function buscarPedidoPorId(req, res) {
  try {
    const pedido = await Pedido.findByPk(req.params.id)

    if (!pedido) {
      return responderNaoEncontrado(res, 'Pedido')
    }

    return res.json(pedido)
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo POST
 * Cria um novo pedido com mesa, status e cliente opcional.
 * Se idPrato for fornecido, cria automaticamente um item com quantidade 1.
 */
export async function criarPedido(req, res) {
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

    return res.status(201).json({
      message: 'Pedido criado com sucesso.',
      data: pedido
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo PUT
 * Atualiza todos os dados de um pedido existente.
 */
export async function atualizarPedido(req, res) {
  try {
    const pedido = await Pedido.findByPk(req.params.id)

    if (!pedido) {
      return responderNaoEncontrado(res, 'Pedido')
    }

    const dadosPedido = await extrairDadosPedido(req.body)
    await pedido.update(dadosPedido)

    return res.json({
      message: 'Pedido atualizado com sucesso.',
      data: pedido
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo PATCH
 * Atualiza apenas parte dos dados de um pedido.
 */
export async function atualizarPedidoParcial(req, res) {
  try {
    const pedido = await Pedido.findByPk(req.params.id)

    if (!pedido) {
      return responderNaoEncontrado(res, 'Pedido')
    }

    const dadosPedido = await extrairDadosPedidoParcial(req.body)
    await pedido.update(dadosPedido)

    return res.json({
      message: 'Pedido atualizado parcialmente com sucesso.',
      data: pedido
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo DELETE
 * Remove um pedido e tambem apaga seus itens para evitar vinculo orfao.
 */
export async function removerPedido(req, res) {
  try {
    const pedido = await Pedido.findByPk(req.params.id)

    if (!pedido) {
      return responderNaoEncontrado(res, 'Pedido')
    }

    await ItemPedido.destroy({ where: { idPedido: req.params.id } })
    await pedido.destroy()

    return res.json({
      message: 'Pedido removido com sucesso.'
    })
  } catch (error) {
    return responderErro(res, error);
  }
}
