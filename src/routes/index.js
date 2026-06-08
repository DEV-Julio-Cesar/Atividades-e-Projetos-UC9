import { Router } from 'express';
import { mostrarInicio, mostrarStatus } from '../controllers/home.controller.js';
import { exigirBancoConectado } from '../config/app.js';
import pagesRoutes from './pages.routes.js';
import clientesRoutes from './clientes.routes.js';
import pratosRoutes from './pratos.routes.js';
import pedidosRoutes from './pedidos.routes.js';
import itensPedidoRoutes from './itensPedido.routes.js';
import routeUser from './user.routes.js';
import routeLogin from './login.routes.js';
import { telaRecuperarSenha, recuperarSenha, telaNovaSenha, salvarNovaSenha } from '../controllers/login.controller.js';

const router = Router();

router.get('/', mostrarInicio);
router.get('/status', mostrarStatus);
router.use('/painel', pagesRoutes);
router.use('/clientes', exigirBancoConectado, clientesRoutes);
router.use('/pratos', exigirBancoConectado, pratosRoutes);
router.use('/pedidos', exigirBancoConectado, pedidosRoutes);
router.use('/itens-pedido', exigirBancoConectado, itensPedidoRoutes);
router.use('/User', routeUser);
router.get('/login/recuperar-senha', telaRecuperarSenha);
router.post('/login/recuperar-senha', recuperarSenha);
router.get('/login/nova-senha', telaNovaSenha);
router.post('/login/nova-senha', salvarNovaSenha);
router.use('/login', routeLogin);//







export default router;
