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
        type: DataTypes.STRING(255), // aumentado para suportar hash bcrypt
        allowNull: false
    },
    perfil: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'cliente'
    }
}, {
    tableName: 'users',
    timestamps: false
})

export default User
