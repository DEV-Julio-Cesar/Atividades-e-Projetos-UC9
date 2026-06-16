import express from 'express'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import routes from '../routes/index.js'
import { apagarCache } from '../middlewares/authUser.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')

const app = express()

// Inicializa status do banco como desconectado
app.locals.statusBanco = {
  conectado: false,
  ultimaMensagem: 'Conectando ao banco de dados...'
}

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(rootDir, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))
app.User = User

// ── SESSÃO (desativado — substituído por JWT) ─────────────────────────────────
// import session from 'express-session'
// import connectPgSimple from 'connect-pg-simple'
// import pg from 'pg'
// const PgStore = connectPgSimple(session)
// const pgPool = new pg.Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { require: true, rejectUnauthorized: false }
// })
// app.use(session({
//   store: new PgStore({ pool: pgPool, tableName: 'sessions', createTableIfMissing: true }),
//   secret: process.env.SESSION_SECRET || 'padaria-secreto-dev',
//   resave: false,
//   saveUninitialized: false,
//   rolling: true,
//   cookie: { maxAge: 1000 * 60 * 60, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' }
// }))
// ── FIM SESSÃO ────────────────────────────────────────────────────────────────

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

app.use(exigirBancoConectado)
app.use('/', routes)

export default app
