import User from '../models/modelUSER.js'

export const autenticar = async (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login')
    }

    try {
        const user = await User.findByPk(req.session.userId.id)
        if (!user) {
            req.session.destroy(() => {})
            return res.redirect('/login')
        }
        req.user = user
        next()
    } catch (error) {
        console.error('Erro ao autenticar usuário:', error)
        return res.redirect('/login')
    }
}

export const validarPerfil = (perfisPermitidos) => {
    return (req, res, next) => {
        const perfilUsuario = req.session.userId?.perfil

        if (!perfilUsuario || !perfisPermitidos.includes(perfilUsuario)) {
            return res.status(403).send('Acesso negado')
        }

        next()
    }
}

export const apagarCache = (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
    next()
}