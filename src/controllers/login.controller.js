import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export const login = (req, res) => {
    return res.render('pages/login')
}

// Esta funcao pode ser expandida para incluir validacao de captcha, limitacao de tentativas ou autenticao multifator
export const validarLogin = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha sao obrigatorios.' })
    }

    try {
        const usuario = await User.findOne({ where: { email } })

        if (!usuario) {
            return res.redirect('/login?erro=Usuário não encontrado.')
        }

        const senhaValida = await bcrypt.compare(password, usuario.password)

        if (!senhaValida) {
            return res.redirect('/login?erro=Senha inválida.')
        }

        // ── JWT ──────────────────────────────────────────────────────────────
        const payload = {
            id: usuario.idUser,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        })

        // Envia o token como cookie HttpOnly (mais seguro que localStorage)
        const maxAge = 60 * 60 // 1 hora em segundos
        const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=/${secure}`)

        return res.redirect('/painel')
        // ── FIM JWT ──────────────────────────────────────────────────────────

        // ── SESSÃO (desativado) ──────────────────────────────────────────────
        // req.session.regenerate((err) => {
        //     if (err) {
        //         console.error('Erro ao regenerar sessao:', err)
        //         return res.status(500).json({ message: 'Erro ao criar sessao.' })
        //     }
        //     req.session.userId = {
        //         id: usuario.idUser,
        //         nome: usuario.nome,
        //         email: usuario.email,
        //         perfil: usuario.perfil
        //     }
        //     return res.redirect('/painel')
        // })
        // ── FIM SESSÃO ───────────────────────────────────────────────────────

    } catch (error) {
        console.error('Erro ao validar login:', error)
        return res.status(500).json({ message: 'Erro ao validar login.' })
    }
}

// Esta funcao pode ser expandida para invalidar tokens de autenticacao ou limpar caches relacionados ao usuario
export const logout = (req, res) => {
    // ── JWT ──────────────────────────────────────────────────────────────────
    // Limpar cookie
    res.setHeader('Set-Cookie', 'token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax')
    
    // Headers para prevenir cache
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.setHeader('Surrogate-Control', 'no-store')
    
    return res.redirect('/login')
    // ── FIM JWT ──────────────────────────────────────────────────────────────

    // ── SESSÃO (desativado) ──────────────────────────────────────────────────
    // req.session.destroy((err) => {
    //     if (err) {
    //         console.error('Erro ao destruir sessao:', err)
    //         return res.status(500).json({ message: 'Erro ao fazer logout.' })
    //     }
    //     res.clearCookie('connect.sid')
    //     return res.redirect('/login')
    // })
    // ── FIM SESSÃO ───────────────────────────────────────────────────────────
}

// Esta funcao pode ser expandida para enviar um email de recuperacao de senha ou gerar um token de redefinicao
export const telaRecuperarSenha = (req, res) => {
    return res.render('pages/recuperar_senha')
}

// Esta funcao pode ser expandida para enviar um email de recuperacao de senha ou gerar um token de redefinicao
export const recuperarSenha = async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ message: 'Informe o e-mail.' })
    }

    const usuario = await User.findOne({ where: { email } })

    if (!usuario) {
        return res.status(404).json({ message: 'Usuario nao encontrado.' })
    }

    return res.redirect(`/login/nova-senha?email=${encodeURIComponent(email)}`)
}

// Esta funcao pode ser expandida para validar um token de redefinicao de senha
export const telaNovaSenha = (req, res) => {
    return res.render('pages/nova_senha')
}

// Esta funcao pode ser expandida para validar um token de redefinicao de senha
export const salvarNovaSenha = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e nova senha sao obrigatorios.' })
    }

    const usuario = await User.findOne({ where: { email } })

    if (!usuario) {
        return res.status(404).json({ message: 'Usuario nao encontrado.' })
    }

    const senhaCriptografada = await bcrypt.hash(password, 10)
    usuario.password = senhaCriptografada
    await usuario.save()

    return res.redirect('/login')
}

export const lougout = logout
