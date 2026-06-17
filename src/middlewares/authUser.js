import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

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
            // Retornar HTML de acesso negado com estilo
            return res.status(403).send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acesso Negado — Padaria Pão Saboroso</title>
    <link rel="stylesheet" href="/css/app.css">
    <style>
        body {
            display: grid;
            place-items: center;
            min-height: 100vh;
            padding: 24px;
        }
        .error-card {
            max-width: 500px;
            padding: 48px;
            text-align: center;
            background: var(--surface-glass);
            backdrop-filter: blur(20px);
            border-radius: var(--radius-lg);
            border: 3px solid var(--danger);
            box-shadow: var(--shadow-lg);
        }
        .error-icon {
            font-size: 4rem;
            margin-bottom: 16px;
        }
        .error-card h1 {
            font-size: 2rem;
            color: var(--danger);
            margin: 16px 0;
        }
        .error-card p {
            color: var(--text-light);
            font-size: 1.1rem;
            margin-bottom: 24px;
        }
        .error-card .button {
            margin-top: 16px;
        }
    </style>
</head>
<body>
    <div class="error-card">
        <div class="error-icon">🚫</div>
        <h1>Acesso Negado</h1>
        <p>Você não possui permissão para acessar esta área. Esta funcionalidade é restrita a administradores.</p>
        <a href="/painel" class="button">← Voltar ao Painel</a>
    </div>
</body>
</html>
            `)
        }

        next()
    }
}

export const apagarCache = (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')
    res.set('Surrogate-Control', 'no-store')
    next()
}
