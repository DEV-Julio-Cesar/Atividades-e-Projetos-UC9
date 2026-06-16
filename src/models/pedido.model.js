import Sequelize from 'sequelize'
import sequelize from '../config/orm.js'

const { DataTypes } = Sequelize

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  mesa: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING
  },
  idCliente: {
    type: DataTypes.STRING,
    foreignKey: true
  }
}, {
  tableName: 'pedidos',
  timestamps: false
})

export default Pedido
