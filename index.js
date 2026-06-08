// index.js - Ponto de entrada da aplicação
import app from './src/config/app.js'
import dotenv from 'dotenv'
import { sincronizarBD } from './src/config/orm.js'

dotenv.config()

// Sincroniza o banco de dados
await sincronizarBD()

// Inicia o servidor Express
// O Render injeta automaticamente a variável PORT; EXPRESS_PORT é usado localmente
const port = process.env.PORT || process.env.EXPRESS_PORT || 3000
const host = process.env.EXPRESS_HOST || '0.0.0.0'

app.listen(port, host, () => {
    console.log(`Servidor em execução em: http://${host}:${port}`)
})