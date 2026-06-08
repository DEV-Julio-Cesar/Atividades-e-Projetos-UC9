import bcrypt from 'bcrypt'
import path from 'path'
import User from '../models/modelUSER.js'

export async function listarUsuarios(req, res) {
    try {
        const usuarios = await User.findAll()
        return res.status(200).json(usuarios)
    } catch (error) {
        console.error('Erro ao listar usuarios:', error)
        return res.status(500).json({ error: 'Erro ao listar usuarios' })
    }
}

export const criarUsuario = async (req, res) => {
    try {
        const nome = req.body.nome || req.body.username
        const email = req.body.email
        const senha = req.body.senha || req.body.password
        const confirmarSenha = req.body.confirmarSenha || req.body.confirmPassword
        const perfil = req.body.perfil || 'cliente'


        if (!nome || !email || !senha) {
            return res.status(400).json({ error: 'Nome, email e senha sao campos obrigatorios' })
        }

        if (confirmarSenha && senha !== confirmarSenha) {
            return res.status(400).json({ error: 'As senhas nao conferem' })
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10)
        await User.create({ nome, email, password: senhaCriptografada, perfil })
        return res.status(201).json({ message: 'Usuario criado com sucesso' })
    } catch (error) {
        console.error('Erro ao criar usuario:', error)
        return res.status(500).json({ error: 'Erro ao criar usuario' })
    }
}

export const cadastrarUsuario = async (req, res) => {
    try {
        return res.sendFile(path.resolve('./public/html/cadastro_Usuario.html'))
    } catch (error) {
        console.error('Erro ao enviar arquivo de cadastro:', error)
        return res.status(500).json({ error: 'Erro ao abrir pagina de cadastro' })
    }
}

export const atualizarUsuario = async (req, res) => {
    const id = req.params.id
    const { nome, email, senha , perfil} = req.body

    try {
        const usuarioBD = await User.findOne({ where: { email } })

        if (!usuarioBD) {
            return res.status(404).json({ message: 'Usuario nao encontrado.' })
        }
        const senhaCriptografada = await bcrypt.hash(senha, 10)
        await User.update({ nome, email, password: senhaCriptografada, perfil }, { where: { idUser: id } })
        return res.status(200).json({ message: 'Usuario atualizado com sucesso.' })
    } catch (error) {
        console.error('Erro ao atualizar usuario:', error)
        return res.status(500).json({ message: 'Erro ao atualizar usuario.' })
    }}
       


    

export const removerUser = async (req, res) => {
    const id = req.params.id

    try {
        const usuario = await User.findByPk(id)

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario nao encontrado.' })
        }

        await User.destroy({ where: { idUser: id } })
        return res.status(200).json({ message: 'Usuario removido com sucesso.' })
    } catch (error) {
        console.error('Erro ao remover usuario:', error)
        return res.status(500).json({ message: 'Erro ao remover usuario.' })
    }
}


export const editarParcial = async (req, res) => {
    const id = req.params.id
    
    try {
        const usuarioNovo = {}
        const { nome, email, senha, perfil } = req.body

        if (nome) usuarioNovo.nome = nome
        if (email) usuarioNovo.email = email
        if (senha) {
            const senhaCriptografada = await bcrypt.hash(senha, 10)
            usuarioNovo.password = senhaCriptografada
            }
        const usuarioBD = await User.findOne({ where: { idUser: id } })
        if(!usuarioBD) {
            return res.status(404).json({ message: 'Usuario nao encontrado.' })
        }
        await User.update(usuarioNovo, { where: { idUser: id } })
        return res.status(200).json({ message: 'Usuario atualizado com sucesso.' })
    } catch (error) {
        console.error('Erro ao atualizar usuario:', error)
        return res.status(500).json({ message: 'Erro ao atualizar usuario.' })
    }
} 
