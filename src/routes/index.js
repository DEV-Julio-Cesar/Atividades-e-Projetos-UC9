import { Router } from 'express';
import jwt from 'jsonwebtoken'
import { mostrarStatus } from '../controllers/home.controller.js';
import { exigirBancoConectado } from '../config/app.js';
import { autenticar } from '../middlewares/authUser.js';
import pagesRoutes from './pages.routes.js';
import clientesRoutes from './clientes.routes.js';
import pratosRoutes from './pratos.routes.js';
import pedidosRoutes from './pedidos.routes.js';
import itensPedidoRoutes from './itensPedido.routes.js';
import routeUser from './user.routes.js';
import routeLogin from './login.routes.js';
import { telaRecuperarSenha, recuperarSenha, telaNovaSenha, salvarNovaSenha } from '../controllers/login.controller.js';

const router = Router();

// Rota raiz — redireciona para login ou painel dependendo do token JWT
router.get('/', (req, res) => {
  const cookieHeader = req.headers.cookie || ''
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)
  const token = match ? match[1] : null

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET)
      return res.redirect('/painel')
    } catch {
      // token inválido ou expirado
    }
  }
  return res.redirect('/login')
});

router.get('/status', mostrarStatus);

// Rotas públicas de login
router.use('/login', routeLogin);
router.use('/User', routeUser);
router.get('/login/recuperar-senha', telaRecuperarSenha);
router.post('/login/recuperar-senha', recuperarSenha);
router.get('/login/nova-senha', telaNovaSenha);
router.post('/login/nova-senha', salvarNovaSenha);

// Rotas protegidas — exigem autenticação
router.use('/painel', autenticar, pagesRoutes);
router.use('/clientes', autenticar, exigirBancoConectado, clientesRoutes);
router.use('/pratos', autenticar, exigirBancoConectado, pratosRoutes);
router.use('/pedidos', autenticar, exigirBancoConectado, pedidosRoutes);
router.use('/itens-pedido', autenticar, exigirBancoConectado, itensPedidoRoutes);

export default router;
