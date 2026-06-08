import { Router } from 'express';
import {
  atualizarPedido,
  atualizarPedidoParcial,
  buscarPedidoPorId,
  criarPedido,
  listarPedidos,
  removerPedido
} from '../controllers/pedido.controller.js';

const router = Router();

router.get('/', listarPedidos);
router.get('/:id', buscarPedidoPorId);
router.post('/', criarPedido);
router.put('/:id', atualizarPedido);
router.patch('/:id', atualizarPedidoParcial);
router.delete('/:id', removerPedido);

export default router;
