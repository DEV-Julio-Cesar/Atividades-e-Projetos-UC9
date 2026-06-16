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

router.get('/', listarPratos);
router.get('/:id', buscarPratoPorId);
router.post('/', validarPerfil(['administrador', 'gerente']), criarPrato);
router.put('/:id', validarPerfil(['administrador', 'gerente']), atualizarPrato);
router.patch('/:id', atualizarPratoParcial);
router.delete('/:id', validarPerfil(['administrador', 'gerente']), removerPrato);

export default router;
