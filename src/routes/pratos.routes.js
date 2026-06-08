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
router.post('/', criarPrato,validarPerfil(['administrador', 'gerente']));
router.put('/:id', atualizarPrato,validarPerfil(['administrador', 'gerente']));
router.patch('/:id', atualizarPratoParcial);
router.delete('/:id', removerPrato,validarPerfil(['administrador', 'gerente']));

export default router;
