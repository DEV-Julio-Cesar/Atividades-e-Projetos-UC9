import { Router } from 'express';
import {
  atualizarPrato,
  atualizarPratoParcial,
  buscarPratoPorId,
  criarPrato,
  listarPratos,
  removerPrato
} from '../controllers/prato.controller.js';
import { validarPerfil } from '../middlewares/authUser.js';

const router = Router();

// Listar e buscar - Todos podem acessar
router.get('/', listarPratos);
router.get('/:id', buscarPratoPorId);

// Criar, atualizar e deletar - Apenas admin
router.post('/', validarPerfil(['admin']), criarPrato);
router.put('/:id', validarPerfil(['admin']), atualizarPrato);
router.patch('/:id', validarPerfil(['admin']), atualizarPratoParcial);
router.delete('/:id', validarPerfil(['admin']), removerPrato);

export default router;
