import { Router } from 'express';
import {
  atualizarItemPedido,
  atualizarItemPedidoParcial,
  buscarItemPedidoPorId,
  criarItemPedido,
  listarItensPedido,
  removerItemPedido
} from '../controllers/itemPedido.controller.js';

const router = Router();

router.get('/', listarItensPedido);
router.get('/:id', buscarItemPedidoPorId);
router.post('/', criarItemPedido);
router.put('/:id', atualizarItemPedido);
router.patch('/:id', atualizarItemPedidoParcial);
router.delete('/:id', removerItemPedido);

export default router;
