import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sequelize;

if (process.env.NODE_ENV === 'production') {
  // Configuração para o PostgreSQL no Render
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Necessário para conexões seguras no Render
      }
    },
    logging: false
  });
} else {
  // Configuração para o SQLite Local
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database/db.sqlite'),
    logging: false
  });
}

export const sincronizarBD = async (app) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
    
    await sequelize.sync({ alter: true });
    
    if (app && app.locals) {
      app.locals.statusBanco = { conectado: true, ultimaMensagem: 'OK' };
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
  }
};

export default sequelize;
