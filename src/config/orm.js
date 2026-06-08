import Sequelize  from 'sequelize'
// Configura a conexão com o banco de dados usando Sequelize e SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './src/database/restaurante.sqlite'
})
// Testa a conexão com o banco de dados
const conexaoBD = async () => {
    try {
        await sequelize.authenticate()
        console.log('Conexão com o banco de dados estabelecida com sucesso!')
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados: ', error)
    }
}
// Chama a função de conexão para garantir que o banco esteja acessível
conexaoBD()
// Exporta a função de sincronização do banco de dados para ser usada em outros arquivos
export const sincronizarBD = async () => {
    try {
        await sequelize.sync({ force: false }) // Use force: true para recriar as tabelas a cada execução (cuidado com dados existentes)
        console.log('Banco de dados sincronizado com sucesso!')
    } catch (error) {
        console.error('Erro ao sincronizar o banco de dados: ', error)
    }
}
// Chama a função de sincronização para garantir que as tabelas estejam criadas
sincronizarBD()

export default sequelize
