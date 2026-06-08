import Sequelize from 'sequelize'
import sequelize from '../config/orm.js'

const { DataTypes } = Sequelize

const Prato = sequelize.define('Prato', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preco: {
    type: DataTypes.REAL,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'pratos',
  timestamps: false
})

export default Prato
