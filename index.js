// index.js - Ponto de entrada da aplicação
import dotenv from 'dotenv'
dotenv.config()

import app from './src/config/app.js'
import { sincronizarBD } from './src/config/orm.js'

// Sincroniza o banco de dados
await sincronizarBD(app)

// Inicia o servidor Express
// O Render injeta automaticamente a variável PORT; EXPRESS_PORT é usado localmente
const port = process.env.PORT || process.env.EXPRESS_PORT || 3000
const host = process.env.EXPRESS_HOST || '0.0.0.0'

app.listen(port, host, () => {
    console.log(`Servidor em execução em: http://${host}:${port}`)
})