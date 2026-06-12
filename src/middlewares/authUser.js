import jwt from 'jsonwebtoken'
import User from '../models/modelUSER.js'

// Lê o cookie 'token' do header sem precisar de cookie-parser
function lerTokenDoCookie(req) {
    const cookieHeader = req.headers.cookie || ''
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/)
    return match ? match[1] : null
}

// ── JWT ───────────────────────────────────────────────────────────────────────
export const autenticar = async (req, res, next) => {
    const token = lerTokenDoCookie(req)
    if (!token) {
        return res.redirect('/login')
    }
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findByPk(payload.id)
        if (!user) {
            res.setHeader('Set-Cookie', 'token=; Max-Age=0; Path=/')
            return res.redirect('/login')
        }

        req.user = user
        req.userId = payload
        next()
    } catch (error) {
        res.setHeader('Set-Cookie', 'token=; Max-Age=0; Path=/')
        return res.redirect('/login')
    }
}
// ── FIM JWT ───────────────────────────────────────────────────────────────────

// ── SESSÃO (desativado) ───────────────────────────────────────────────────────
// export const autenticar = async (req, res, next) => {
//     if (!req.session.userId) {
//         return res.redirect('/login')
//     }
//     try {
//         const user = await User.findByPk(req.session.userId.id)
//         if (!user) {
//             req.session.destroy(() => {})
//             return res.redirect('/login')
//         }
//         req.user = user
//         next()
//     } catch (error) {
//         console.error('Erro ao autenticar usuário:', error)
//         return res.redirect('/login')
//     }
// }
// ── FIM SESSÃO ────────────────────────────────────────────────────────────────

export const validarPerfil = (perfisPermitidos) => {
    return (req, res, next) => {
        const perfilUsuario = req.userId?.perfil || req.user?.perfil

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
