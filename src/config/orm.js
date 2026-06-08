import Sequelize from 'sequelize'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Resolve o caminho do banco de forma compatível com Render e ambiente local
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../src/database/restaurante.sqlite')

// Configura a conexão com o banco de dados usando Sequelize e SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
})

// Exporta a função de sincronização do banco de dados para ser usada em outros arquivos
export const sincronizarBD = async () => {
    try {
        await sequelize.authenticate()
        console.log('Conexão com o banco de dados estabelecida com sucesso!')
        await sequelize.sync({ force: false })
        console.log('Banco de dados sincronizado com sucesso!')
    } catch (error) {
        console.error('Erro ao sincronizar o banco de dados: ', error)
    }
}

export default sequelize
