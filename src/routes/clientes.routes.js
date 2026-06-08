import { Router } from 'express';
import {
  atualizarCliente,
  atualizarClienteParcial,
  buscarClientePorId,
  criarCliente,
  listarClientes,
  removerCliente
} from '../controllers/cliente.controller.js';

const router = Router();

router.get('/', listarClientes);
router.get('/:id', buscarClientePorId);
router.post('/', criarCliente);
router.put('/:id', atualizarCliente);
router.patch('/:id', atualizarClienteParcial);
router.delete('/:id', removerCliente);

export default router;
