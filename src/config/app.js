import express from 'express'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import routes from '../routes/index.js'
import sequelize from './orm.js'
import User from '../models/modelUSER.js'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import pg from 'pg'
import { apagarCache } from '../middlewares/authUser.js'

const PgStore = connectPgSimple(session)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')

// Pool nativo pg com SSL para o store de sessões
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false }
})

const app = express()

// Inicializa status do banco como desconectado
app.locals.statusBanco = {
  conectado: false,
  ultimaMensagem: 'Conectando ao banco de dados...'
}
app.use = (apagarCache, app.use)
app.use(morgan('dev')) // middleware de logging
app.use(express.json()) // middleware para fazer o parsear JSON no corpo das requisicoes
app.use(express.urlencoded({ extended: true })) // middleware para fazer o parsear dados de formularios
app.use(express.static(path.join(rootDir, 'public'))) // middleware para arquivos estaticos da pasta public
app.set('view engine', 'ejs') // Configura o mecanismo de visualizacao para EJS
app.set('views', path.join(__dirname, '../views')) // Configura o diretorio das views
app.User = User // Torna o modelo User acessivel em todo o aplicativo atraves de app.User

/**
 * Middleware que verifica se o banco de dados esta conectado.
 * Se nao estiver, retorna erro 503 (Service Unavailable).
 */

app.use(session({
  store: new PgStore({
    pool: pgPool,
    tableName: 'sessions',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'padaria-secreto-dev',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hora
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}))





export function exigirBancoConectado(req, res, next) {
  if (req.path.startsWith('/login')) {
    return next()
  }

  if (app.locals.statusBanco?.conectado) {
    next()
  } else {
    console.error('Banco de dados nao esta disponivel')
    res.status(503).json({
      erro: 'Banco de dados indisponivel',
      mensagem: 'O servico nao esta disponivel no momento. Tente novamente mais tarde.'
    })
  }
}

try {
  await sequelize.authenticate()
  app.locals.statusBanco = {
    conectado: true,
    ultimaMensagem: 'Banco de dados conectado com sucesso!'
  }
  console.log('Banco conectado!')
} catch (error) {
  app.locals.statusBanco = {
    conectado: false,
    ultimaMensagem: `Erro: ${error.message}`
  }
  console.error('Erro ao conectar:', error.message)
}

// Aplica o middleware de verificacao de banco em todas as rotas
app.use(exigirBancoConectado)

app.use('/', routes)

export default app
