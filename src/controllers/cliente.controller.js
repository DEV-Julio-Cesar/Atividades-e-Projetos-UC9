import { Cliente, Pedido } from '../models/index.js';
import {
  criarErroHttp,
  criarId,
  responderErro,
  responderNaoEncontrado
} from './controller.helpers.js';

/**
 * Organiza e valida os dados completos do cliente.
 * Esse helper e usado por PUT, porque no PUT normalmente enviamos o objeto inteiro.
 */
function extrairDadosCliente(body) {
  const nome = body.nome?.trim();
  const telefone = body.telefone?.trim() || null;

  if (!nome) {
    throw criarErroHttp('O campo nome e obrigatorio.');
  }

  return { nome, telefone };
}

/**
 * Organiza e valida apenas os campos enviados parcialmente.
 * Esse helper e usado por PATCH, porque no PATCH podemos alterar so um campo.
 */
function extrairDadosClienteParcial(body) {
  const dadosCliente = {};

  if (body.nome !== undefined) {
    const nome = body.nome?.trim();

    if (!nome) {
      throw criarErroHttp('O campo nome nao pode ficar vazio.');
    }

    dadosCliente.nome = nome;
  }

  if (body.telefone !== undefined) {
    dadosCliente.telefone = body.telefone?.trim() || null;
  }

  if (Object.keys(dadosCliente).length === 0) {
    throw criarErroHttp('Envie pelo menos um campo para atualizar no PATCH.');
  }

  return dadosCliente;
}

/**
 * Metodo GET
 * Lista todos os clientes cadastrados no banco.
 */
export async function listarClientes(req, res) {
  try {
    const clientes = await Cliente.findAll()

    return res.json(clientes)
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo GET
 * Busca apenas um cliente pelo ID informado na URL.
 */
export async function buscarClientePorId(req, res) {
  try {
    const cliente = await Cliente.findByPk(req.params.id)

    if (!cliente) {
      return responderNaoEncontrado(res, 'Cliente')
    }

    return res.json(cliente)
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo POST
 * Cria um novo cliente usando os dados enviados no corpo da requisicao.
 */
export async function criarCliente(req, res) {
  try {
    const dadosCliente = extrairDadosCliente(req.body)
    const cliente = await Cliente.create({
      id: criarId(),
      ...dadosCliente
    })

    return res.status(201).json({
      message: 'Cliente criado com sucesso.',
      data: cliente
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo PUT
 * Atualiza todos os dados de um cliente existente.
 * No PUT o ideal e mandar o objeto completo.
 */
export async function atualizarCliente(req, res) {
  try {
    const cliente = await Cliente.findByPk(req.params.id) // metodo get para buscar o cliente pelo ID

    if (!cliente) {
      return responderNaoEncontrado(res, 'Cliente')
    }

    const dadosCliente = extrairDadosCliente(req.body)
    await cliente.update(dadosCliente)

    return res.json({
      message: 'Cliente atualizado com sucesso.',
      data: cliente
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo PATCH
 * Atualiza apenas parte dos dados do cliente.
 * Exemplo: alterar so o telefone sem reenviar nome.
 */
export async function atualizarClienteParcial(req, res) {
  try {
    const cliente = await Cliente.findByPk(req.params.id)

    if (!cliente) {
      return responderNaoEncontrado(res, 'Cliente')
    }

    const dadosCliente = extrairDadosClienteParcial(req.body)
    await cliente.update(dadosCliente)

    return res.json({
      message: 'Cliente atualizado parcialmente com sucesso.',
      data: cliente
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo DELETE
 * Remove um cliente, mas antes verifica se ele ja possui pedidos vinculados.
 */
export async function removerCliente(req, res) {
  try {
    const cliente = await Cliente.findByPk(req.params.id)

    if (!cliente) {
      return responderNaoEncontrado(res, 'Cliente')
    }

    const quantidadePedidos = await Pedido.count({ where: { idCliente: req.params.id } })

    if (quantidadePedidos > 0) {
      throw criarErroHttp(
        'Este cliente possui pedidos vinculados e nao pode ser removido.',
        409
      )
    }

    await cliente.destroy()

    return res.json({
      message: 'Cliente removido com sucesso.'
    })
  } catch (error) {
    return responderErro(res, error);
  }
}
