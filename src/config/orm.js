import Sequelize from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
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

        // Cria usuário master se não existir
        await criarUsuarioMaster()

    } catch (error) {
        console.error('Erro ao sincronizar o banco de dados: ', error)
    }
}

async function criarUsuarioMaster() {
    try {
        // Import dinâmico para evitar dependência circular
        const { default: User } = await import('../models/modelUSER.js')
        const bcrypt = await import('bcrypt')

        const masterEmail = process.env.MASTER_EMAIL || 'master@padaria.com'
        const masterSenha = process.env.MASTER_PASSWORD || 'master123'

        const existe = await User.findOne({ where: { email: masterEmail } })

        if (!existe) {
            const senhaCriptografada = await bcrypt.default.hash(masterSenha, 10)
            await User.create({
                nome: 'Maximo',
                email: masterEmail,
                password: senhaCriptografada,
                perfil: 'admin'
            })
            console.log(`✅ Usuário master criado: ${masterEmail} / ${masterSenha}`)
        } else {
            console.log('ℹ️  Usuário master já existe.')
        }
    } catch (error) {
        console.error('Erro ao criar usuário master:', error.message)
    }
}

export default sequelize
