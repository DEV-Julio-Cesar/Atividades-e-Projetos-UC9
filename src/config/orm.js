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

    // Cria usuário master se não existir
    await criarUsuarioMaster();
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
  }
};

async function criarUsuarioMaster() {
  try {
    // Import dinâmico para evitar dependência circular
    const { default: User } = await import('../models/user.model.js');
    const bcrypt = await import('bcrypt');

    const masterEmail = process.env.MASTER_EMAIL || 'master@padaria.com';
    const masterSenha = process.env.MASTER_PASSWORD || 'Master@2024';

    const existe = await User.findOne({ where: { email: masterEmail } });

    if (!existe) {
      const senhaCriptografada = await bcrypt.default.hash(masterSenha, 10);
      await User.create({
        nome: 'Administrador Master',
        email: masterEmail,
        password: senhaCriptografada,
        perfil: 'admin'
      });
      console.log(`✅ Usuário master criado: ${masterEmail} / ${masterSenha}`);
    } else {
      console.log('ℹ️  Usuário master já existe.');
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário master:', error.message);
  }
}

export default sequelize;
