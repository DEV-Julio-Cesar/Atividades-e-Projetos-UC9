import express from 'express';
import { login, validarLogin, logout, lougout, telaRecuperarSenha, recuperarSenha, telaNovaSenha, salvarNovaSenha   } from '../controllers/login.controller.js';
import { autenticar } from '../middlewares/authUser.js';
const routeLogin = express.Router();

routeLogin.get('/', login,autenticar);
routeLogin.post('/', validarLogin);
routeLogin.get('/validar', validarLogin);
routeLogin.post('/logout', autenticar, logout);
routeLogin.post('/lougout', lougout);
routeLogin.get('/recuperar-senha', telaRecuperarSenha);
routeLogin.post('/recuperar-senha', recuperarSenha);
routeLogin.get('/nova-senha', telaNovaSenha)
routeLogin.post('/nova-senha', salvarNovaSenha)

export default routeLogin;

