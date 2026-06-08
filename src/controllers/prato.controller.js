import { ItemPedido, Prato } from '../models/index.js';
import {
  criarErroHttp,
  criarId,
  responderErro,
  responderNaoEncontrado
} from './controller.helpers.js';

/**
 * Organiza e valida os dados completos do prato.
 * Esse helper e usado no PUT e no POST.
 */
function extrairDadosPrato(body) {
  const nome = body.nome?.trim();
  const categoria = body.categoria?.trim() || null;
  const preco = Number(body.preco);

  if (!nome) {
    throw criarErroHttp('O campo nome e obrigatorio.');
  }

  if (Number.isNaN(preco) || preco < 0) {
    throw criarErroHttp('O campo preco deve ser um numero maior ou igual a zero.');
  }

  return { nome, categoria, preco };
}

/**
 * Organiza e valida os dados parciais do prato.
 * Esse helper e usado no PATCH.
 */
function extrairDadosPratoParcial(body) {
  const dadosPrato = {};

  if (body.nome !== undefined) {
    const nome = body.nome?.trim();

    if (!nome) {
      throw criarErroHttp('O campo nome nao pode ficar vazio.');
    }

    dadosPrato.nome = nome;
  }

  if (body.categoria !== undefined) {
    dadosPrato.categoria = body.categoria?.trim() || null;
  }

  if (body.preco !== undefined) {
    const preco = Number(body.preco);

    if (Number.isNaN(preco) || preco < 0) {
      throw criarErroHttp('O campo preco deve ser um numero maior ou igual a zero.');
    }

    dadosPrato.preco = preco;
  }

  if (Object.keys(dadosPrato).length === 0) {
    throw criarErroHttp('Envie pelo menos um campo para atualizar no PATCH.');
  }

  return dadosPrato;
}

/**
 * Metodo GET
 * Retorna todos os pratos cadastrados.
 */
export async function listarPratos(req, res) {
  try {
    const pratos = await Prato.findAll()

    return res.json(pratos)
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo GET
 * Retorna um prato especifico com base no ID recebido.
 */
export async function buscarPratoPorId(req, res) {
  try {
    const prato = await Prato.findByPk(req.params.id)

    if (!prato) {
      return responderNaoEncontrado(res, 'Prato')
    }

    return res.json(prato)
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo POST
 * Cria um prato novo na tabela de pratos.
 */
export async function criarPrato(req, res) {
  try {
    const dadosPrato = extrairDadosPrato(req.body)
    const prato = await Prato.create({
      id: criarId(),
      ...dadosPrato
    })

    return res.status(201).json({
      message: 'Prato criado com sucesso.',
      data: prato
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo PUT
 * Atualiza todos os dados de um prato existente.
 */
export async function atualizarPrato(req, res) {
  try {
    const prato = await Prato.findByPk(req.params.id)

    if (!prato) {
      return responderNaoEncontrado(res, 'Prato')
    }

    const dadosPrato = extrairDadosPrato(req.body)
    await prato.update(dadosPrato)

    return res.json({
      message: 'Prato atualizado com sucesso.',
      data: prato
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo PATCH
 * Atualiza apenas parte dos dados de um prato.
 */
export async function atualizarPratoParcial(req, res) {
  try {
    const prato = await Prato.findByPk(req.params.id)

    if (!prato) {
      return responderNaoEncontrado(res, 'Prato')
    }

    const dadosPrato = extrairDadosPratoParcial(req.body)
    await prato.update(dadosPrato)

    return res.json({
      message: 'Prato atualizado parcialmente com sucesso.',
      data: prato
    })
  } catch (error) {
    return responderErro(res, error);
  }
}

/**
 * Metodo DELETE
 * Remove um prato somente se ele ainda nao estiver sendo usado em itens de pedido.
 */
export async function removerPrato(req, res) {
  try {
    const prato = await Prato.findByPk(req.params.id)

    if (!prato) {
      return responderNaoEncontrado(res, 'Prato')
    }

    const quantidadeItens = await ItemPedido.count({ where: { idPrato: req.params.id } })

    if (quantidadeItens > 0) {
      throw criarErroHttp(
        'Este prato esta vinculado a itens de pedido e nao pode ser removido.',
        409
      )
    }

    await prato.destroy()

    return res.json({
      message: 'Prato removido com sucesso.'
    })
  } catch (error) {
    return responderErro(res, error);
  }
}
