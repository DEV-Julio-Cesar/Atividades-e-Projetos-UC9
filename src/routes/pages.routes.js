import { Router } from 'express';
import {
  cadastrarClientePelaPagina,
  cadastrarItemPedidoPelaPagina,
  cadastrarPedidoPelaPagina,
  cadastrarPratoPelaPagina,
  mostrarDashboard,
  mostrarPaginaClientes,
  mostrarPaginaItensPedido,
  mostrarPaginaPedidos,
  mostrarPaginaPratos
} from '../controllers/pages.controller.js';

const router = Router();

router.get('/', mostrarDashboard);
router.get('/clientes', mostrarPaginaClientes);
router.post('/clientes', cadastrarClientePelaPagina);
router.get('/pratos', mostrarPaginaPratos);
router.post('/pratos', cadastrarPratoPelaPagina);
router.get('/pedidos', mostrarPaginaPedidos);
router.post('/pedidos', cadastrarPedidoPelaPagina);
router.get('/itens-pedido', mostrarPaginaItensPedido);
router.post('/itens-pedido', cadastrarItemPedidoPelaPagina);

export default router;
