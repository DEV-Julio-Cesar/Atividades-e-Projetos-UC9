import sequelize from "../config/orm.js";
import Sequelize from "sequelize";

const { DataTypes } = Sequelize;

const User = sequelize.define('User', {
    idUser: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    perfil: { // 'admin' ou 'cliente'
        type: DataTypes.STRING(100),
        allowNull: false,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    }
}, 

{
    tableName: 'users', // nome da tabela no banco de dados
    timestamps: false, // desativa os campos createdAt e updatedAt
    charset: 'utf8',
    collate: 'utf8_general_ci'
})



export default User;
