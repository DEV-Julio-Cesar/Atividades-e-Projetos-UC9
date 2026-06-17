import express from 'express';
import { listarUsuarios, criarUsuario, cadastrarUsuario, atualizarUsuario, removerUser, editarParcial } from '../controllers/user.controller.js';
import { autenticar, validarPerfil } from '../middlewares/authUser.js';

const routeUser = express.Router();

// Todas as rotas de usuário requerem autenticação e perfil admin
routeUser.get('/', autenticar, validarPerfil(['admin']), listarUsuarios);
routeUser.post('/', autenticar, validarPerfil(['admin']), criarUsuario);
routeUser.get('/cadastroUsuario', autenticar, validarPerfil(['admin']), cadastrarUsuario);
routeUser.put('/:id', autenticar, validarPerfil(['admin']), atualizarUsuario);
routeUser.delete('/:id', autenticar, validarPerfil(['admin']), removerUser);
routeUser.patch('/:id', autenticar, validarPerfil(['admin']), editarParcial);

export default routeUser;
