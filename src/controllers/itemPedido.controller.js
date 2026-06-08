import { ItemPedido, Pedido, Prato } from '../models/index.js';
import {
  criarErroHttp,
  criarId,
  responderErro,
  responderNaoEncontrado
} from './controller.helpers.js';

/**
 * Garante que o pedido informado existe antes de criar ou atualizar um item.
 */
async function validarPedido(idPedido) {
  const pedido = await Pedido.findByPk(idPedido)

  if (!pedido) {
    throw criarErroHttp('O pedido informado nao existe.')
  }
}

async function validarPrato(idPrato) {
  const prato = await Prato.findByPk(idPrato)

  if (!prato) {
    throw criarErroHttp('O prato informado nao existe.')
  }
}

/**
 * Organiza e valida os dados completos do item do pedido.
 * Esse helper e usado no POST e no PUT.
 */
async function extrairDadosItemPedido(body) {
  const quantidade = Number(body.quantidade);
  const idPedido = body.idPedido?.trim();
  const idPrato = body.idPrato?.trim();

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw criarErroHttp('O campo quantidade deve ser um numero inteiro maior que zero.');
  }

  if (!idPedido) {
    throw criarErroHttp('O campo idPedido e obrigatorio.');
  }

  if (!idPrato) {
    throw criarErroHttp('O campo idPrato e obrigatorio.');
  }

  await validarPedido(idPedido);
  await validarPrato(idPrato);

  return { quantidade, idPedido, idPrato };
}

/**
 * Organiza e valida os dados parciais do item do pedido.
 * Esse helper e usado no PATCH.
 */
async function extrairDadosItemPedidoParcial(body) {
  const dadosItemPedido = {};

  if (body.quantidade !== undefined) {
    const quantidade = Number(body.quantidade);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw criarErroHttp('O campo quantidade deve ser um numero inteiro maior que zero.');
    }

    dadosItemPedido.quantidade = quantidade;
  }

  if (body.idPedido !== undefined) {
    const idPedido = body.idPedido?.trim();

    if (!idPedido) {
      throw criarErroHttp('O campo idPedido nao pode ficar vazio.');
    }

    await validarPedido(idPedido);
    dadosItemPedido.idPedido = idPedido;
  }

  if (body.idPrato !== undefined) {
    const idPrato = body.idPrato?.trim();

    if (!idPrato) {
      throw criarErroHttp('O campo idPrato nao pode ficar vazio.');
    }

    await validarPrato(idPrato);
    dadosItemPedido.idPrato = idPrato;
  }

  if (Object.keys(dadosItemPedido).length === 0) {
    throw criarErroHttp('Envie pelo menos um campo para atualizar no PATCH.');
  }

  return dadosItemPedido;
}

/**
 * Metodo GET
 * Lista todos os itens de pedido com seus relacionamentos.
 */
export async function listarItensPedido(req, res) {
  try {
    const itensPedido = await ItemPedido.findAll()

    return res.json(itensPedido)
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo GET
 * Busca um item de pedido especifico.
 */
export async function buscarItemPedidoPorId(req, res) {
  try {
    const itemPedido = await ItemPedido.findByPk(req.params.id)

    if (!itemPedido) {
      return responderNaoEncontrado(res, 'Item do pedido')
    }

    return res.json(itemPedido)
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo POST
 * Cria um novo item vinculando pedido e prato.
 */
export async function criarItemPedido(req, res) {
  try {
    const dadosItemPedido = await extrairDadosItemPedido(req.body)
    const itemPedido = await ItemPedido.create({
      id: criarId(),
      ...dadosItemPedido
    })

    return res.status(201).json({
      message: 'Item do pedido criado com sucesso.',
      data: itemPedido
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo PUT
 * Atualiza todos os dados de um item de pedido ja existente.
 */
export async function atualizarItemPedido(req, res) {
  try {
    const itemPedido = await ItemPedido.findByPk(req.params.id)

    if (!itemPedido) {
      return responderNaoEncontrado(res, 'Item do pedido')
    }

    const dadosItemPedido = await extrairDadosItemPedido(req.body)
    await itemPedido.update(dadosItemPedido)

    return res.json({
      message: 'Item do pedido atualizado com sucesso.',
      data: itemPedido
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo PATCH
 * Atualiza apenas parte dos dados do item do pedido.
 */
export async function atualizarItemPedidoParcial(req, res) {
  try {
    const itemPedido = await ItemPedido.findByPk(req.params.id)

    if (!itemPedido) {
      return responderNaoEncontrado(res, 'Item do pedido')
    }

    const dadosItemPedido = await extrairDadosItemPedidoParcial(req.body)
    await itemPedido.update(dadosItemPedido)

    return res.json({
      message: 'Item do pedido atualizado parcialmente com sucesso.',
      data: itemPedido
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo DELETE
 * Remove um item de pedido especifico.
 */
export async function removerItemPedido(req, res) {
  try {
    const itemPedido = await ItemPedido.findByPk(req.params.id)

    if (!itemPedido) {
      return responderNaoEncontrado(res, 'Item do pedido')
    }

    await itemPedido.destroy()

    return res.json({
      message: 'Item do pedido removido com sucesso.'
    })
  } catch (error) {
    return responderErro(res, error);
  }
}
