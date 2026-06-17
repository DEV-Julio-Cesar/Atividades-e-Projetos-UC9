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
    
    // Cria produtos de padaria em destaque
    await criarProdutosDestaque();
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

async function criarProdutosDestaque() {
  try {
    const { default: Prato } = await import('../models/prato.model.js');
    const { v4: uuidv4 } = await import('uuid');

    // Verifica se já existem produtos
    const count = await Prato.count();
    
    if (count > 0) {
      console.log('ℹ️  Produtos já cadastrados no sistema.');
      return;
    }

    // Lista de produtos típicos de padaria
    const produtos = [
      { nome: 'Pão Francês', categoria: 'Pães', preco: 0.50 },
      { nome: 'Pão de Forma Integral', categoria: 'Pães', preco: 8.90 },
      { nome: 'Croissant', categoria: 'Pães', preco: 6.50 },
      { nome: 'Pão de Queijo', categoria: 'Salgados', preco: 3.50 },
      { nome: 'Coxinha de Frango', categoria: 'Salgados', preco: 5.00 },
      { nome: 'Pastel de Carne', categoria: 'Salgados', preco: 5.50 },
      { nome: 'Brigadeiro', categoria: 'Doces', preco: 2.50 },
      { nome: 'Bolo de Chocolate', categoria: 'Bolos', preco: 35.00 },
      { nome: 'Torta de Morango', categoria: 'Bolos', preco: 45.00 },
      { nome: 'Sonho de Valsa', categoria: 'Doces', preco: 4.50 },
      { nome: 'Café Expresso', categoria: 'Bebidas', preco: 4.00 },
      { nome: 'Suco de Laranja Natural', categoria: 'Bebidas', preco: 8.00 }
    ];

    // Cria os produtos
    for (const produto of produtos) {
      await Prato.create({
        id: uuidv4(),
        nome: produto.nome,
        categoria: produto.categoria,
        preco: produto.preco
      });
    }

    console.log(`✅ ${produtos.length} produtos de padaria cadastrados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao criar produtos de destaque:', error.message);
  }
}

export default sequelize;
