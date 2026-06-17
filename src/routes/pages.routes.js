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
import { validarPerfil } from '../middlewares/authUser.js';

const router = Router();

// Dashboard - Todos podem acessar
router.get('/', mostrarDashboard);

// Clientes - Apenas admin
router.get('/clientes', validarPerfil(['admin']), mostrarPaginaClientes);
router.post('/clientes', validarPerfil(['admin']), cadastrarClientePelaPagina);

// Pratos/Produtos - Apenas admin
router.get('/pratos', validarPerfil(['admin']), mostrarPaginaPratos);
router.post('/pratos', validarPerfil(['admin']), cadastrarPratoPelaPagina);

// Pedidos - Todos podem acessar (admin e cliente/funcionário)
router.get('/pedidos', mostrarPaginaPedidos);
router.post('/pedidos', cadastrarPedidoPelaPagina);

// Itens do Pedido - Todos podem acessar (admin e cliente/funcionário)
router.get('/itens-pedido', mostrarPaginaItensPedido);
router.post('/itens-pedido', cadastrarItemPedidoPelaPagina);

export default router;
