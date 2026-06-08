import express from 'express';
import { listarUsuarios, criarUsuario, cadastrarUsuario, atualizarUsuario, removerUser, editarParcial } from '../controllers/controlUser.js';

const routeUser = express.Router();

routeUser.get('/', listarUsuarios);
routeUser.post('/', criarUsuario);
routeUser.get('/cadastroUsuario', cadastrarUsuario);
routeUser.put('/:id', atualizarUsuario);
routeUser.delete('/:id', removerUser);
routeUser.patch('/:id', editarParcial);

export default routeUser;
