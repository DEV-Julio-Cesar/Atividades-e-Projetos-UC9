import { Router } from 'express';
import {
  atualizarCliente,
  atualizarClienteParcial,
  buscarClientePorId,
  criarCliente,
  listarClientes,
  removerCliente
} from '../controllers/cliente.controller.js';
import { validarPerfil } from '../middlewares/authUser.js';

const router = Router();

// Todas as operações de clientes - Apenas admin
router.get('/', validarPerfil(['admin']), listarClientes);
router.get('/:id', validarPerfil(['admin']), buscarClientePorId);
router.post('/', validarPerfil(['admin']), criarCliente);
router.put('/:id', validarPerfil(['admin']), atualizarCliente);
router.patch('/:id', validarPerfil(['admin']), atualizarClienteParcial);
router.delete('/:id', validarPerfil(['admin']), removerCliente);

export default router;
