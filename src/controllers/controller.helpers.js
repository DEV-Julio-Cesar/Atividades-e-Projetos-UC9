
// Este arquivo contém funções auxiliares para os controllers, como geração de IDs e tratamento de erros.


import { randomUUID } from 'node:crypto';

/**
 * Gera um identificador único para ser usado como chave primária.
 */
export function criarId() {
  return randomUUID();
}

/**
 * Cria um erro padronizado para simplificar as validações nos controllers.
 */
export function criarErroHttp(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

/**
 * Envia uma resposta 404 quando o registro procurado não existe.
 */
export function responderNaoEncontrado(res, entidade) {
  return res.status(404).json({
    message: `${entidade} não encontrado(a).`
  });
}

/**
 * Centraliza o tratamento de erros para evitar repetição de código.
 */
export function responderErro(res, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);

  return res.status(500).json({
    message: 'Ocorreu um erro interno no servidor.'
  });
}
