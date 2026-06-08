import express from 'express'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import routes from '../routes/index.js'
import sequelize from './orm.js'
import User from '../models/modelUSER.js'
import session from 'express-session'
import connectSqlite3 from 'connect-sqlite3'
import { apagarCache } from '../middlewares/authUser.js'

const SQLiteStore = connectSqlite3(session)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../../')

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
  store: new SQLiteStore({
    db: 'restaurante.sqlite',
    dir: './src/database',
    table: 'sessions',
    ttl: 60 * 60 * 24,// 1 hora
    concurrentDB: true
  }),
  secret: 'restaurante-secreto', // Em producao, use uma string secreta mais forte e armazene em variavel de ambiente
  resave: false, // Evita salvar a sessao se ela nao foi modificada
  saveUninitialized: false, // Evita criar sessoes para usuarios nao autenticados
  rolling: true, // Renova o cookie a cada resposta
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
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

app.use('/', routes) // Usa as rotas definidas no arquivo de rotas para a raiz do aplicativo

app.get('/', (req, res) => {
  res.render('index', {
    login: {},
    statusBanco: app.locals.statusBanco,
    title: 'API-Restaurante',
    message: 'O painel dinamico depende do banco conectado.',
    endpoints: [
      'GET /status',
      'GET /painel',
      'GET /painel/clientes',
      'GET /painel/pratos',
      'GET /painel/pedidos',
      'GET /painel/itens-pedido'
    ]
  })
})

export default app
