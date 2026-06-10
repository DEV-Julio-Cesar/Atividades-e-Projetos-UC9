import Sequelize from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // necessário no Render (certificado autoassinado)
        }
    },
    logging: false
})

export const sincronizarBD = async () => {
    try {
        await sequelize.authenticate()
        console.log('Conexão com PostgreSQL estabelecida com sucesso!')
        await sequelize.sync({ force: false })
        console.log('Banco de dados sincronizado com sucesso!')
    } catch (error) {
        console.error('Erro ao sincronizar o banco de dados: ', error)
    }
}

export default sequelize
