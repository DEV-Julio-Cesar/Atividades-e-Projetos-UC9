import path from 'path'
import bcrypt from 'bcrypt'
import User from '../models/modelUSER.js'

export const login = (req, res) => {
    return res.sendFile(path.resolve('./public/html/login.html'))
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
            return res.status(401).json({ message: 'Usuario nao encontrado.' })
        }

  const senhaValida = await bcrypt.compare(password, usuario.password)

if (!senhaValida) {
    return res.redirect('/login?erro=Senha invalida')
}

req.session.regenerate((err) => {
    if (err) {
        console.error('Erro ao regenerar sessao:', err)
        return res.status(500).json({ message: 'Erro ao criar sessao.' })
    }
    req.session.userId = {
        id: usuario.idUser,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
    }
    return res.redirect('/painel')
})
    }
     catch (error) {
        console.error('Erro ao validar login:', error)
        return res.status(500).json({ message: 'Erro ao validar login.' })
    }
}




// Esta funcao pode ser expandida para invalidar tokens de autenticacao ou limpar caches relacionados ao usuario
export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir sessao:', err)
            return res.status(500).json({ message: 'Erro ao fazer logout.' })
        }
        res.clearCookie('connect.sid') // Limpa o cookie de sessao
        return res.redirect('/login')
    })
}

//  Esta funcao pode ser expandida para enviar um email de recuperacao de senha ou gerar um token de redefinicao
export const telaRecuperarSenha = (req, res) => {
  return res.sendFile(path.resolve('./public/html/recuperar_senha.html'))
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
  return res.sendFile(path.resolve('./public/html/nova_senha.html'))
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
